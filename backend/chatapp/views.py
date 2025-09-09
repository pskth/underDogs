import os
from dotenv import load_dotenv
import google.generativeai as genai

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain

from .models import PDF
from .serializers import PDFSerializer


# 🔹 Load API Key
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment.")
genai.configure(api_key=api_key)

FAISS_FOLDER_PATH = "faiss_indices"
os.makedirs(FAISS_FOLDER_PATH, exist_ok=True)


class PDFViewSet(viewsets.ModelViewSet):
    """
    Upload PDFs → extract text → store in FAISS → chat with them.
    """

    serializer_class = PDFSerializer
    parser_classes = (
        MultiPartParser,
        FormParser,
        JSONParser,
    )  # ✅ allows both upload + JSON
    queryset = PDF.objects.all()

    def perform_create(self, serializer):
        """
        On upload:
        1. Save PDF.
        2. Extract text, split into chunks.
        3. Build FAISS index.
        """
        pdf_instance = serializer.save()
        pdf_path = pdf_instance.file.path

        # Extract text
        text = self.extract_pdf_text(pdf_path)
        if not text.strip():
            raise ValueError(f"No extractable text found in {pdf_instance.file.name}.")

        chunks = self.split_text_into_chunks(text)
        if not chunks:
            raise ValueError(f"Could not split {pdf_instance.file.name} into chunks.")

        # Build FAISS index
        self.build_faiss_index(chunks, pdf_instance)

    # --- Helpers ---
    def extract_pdf_text(self, path: str) -> str:
        reader = PdfReader(path)
        return "".join([page.extract_text() or "" for page in reader.pages])

    def split_text_into_chunks(self, text: str):
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        return splitter.split_text(text)

    def build_faiss_index(self, chunks, pdf: PDF):
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

        if not chunks:
            raise ValueError(f"No text chunks to embed for {pdf.file.name}.")

        try:
            vector_store = FAISS.from_texts(chunks, embeddings)
        except Exception as e:
            raise RuntimeError(f"Failed to build FAISS index: {str(e)}")

        path = os.path.join(FAISS_FOLDER_PATH, f"faiss_{pdf.id}")
        vector_store.save_local(path)

    # --- Chat with PDF ---
    @action(detail=True, methods=["post"], url_path="chat")
    def chat_with_pdf(self, request, pk=None):
        pdf = self.get_object()
        question = request.data.get("question", "").strip()
        if not question:
            return Response({"error": "Question cannot be empty."}, status=400)

        # Load FAISS index
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        index_path = os.path.join(FAISS_FOLDER_PATH, f"faiss_{pdf.id}")

        if not os.path.exists(index_path):
            return Response({"error": "No index found for this PDF."}, status=404)

        vector_db = FAISS.load_local(
            index_path, embeddings, allow_dangerous_deserialization=True
        )

        # Search relevant docs
        docs = vector_db.similarity_search(question, k=3)

        if not docs:
            return Response(
                {"answer": "No relevant information found in the PDF."}, status=200
            )

        # Run QA Chain
        response = self.run_qa_chain(docs, question)
        return Response({"answer": response["output_text"]}, status=200)

    def run_qa_chain(self, docs, question: str):
        prompt_template = """
        You are a helpful AI assistant. 
        Answer the question based only on the provided context. 
        If the context is not enough, reply: 
        "The answer is not available in the provided context."

        Context:
        {context}

        Question:
        {question}

        Answer:
        """
        model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", client=genai, temperature=0.3
        )
        prompt = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )
        chain = load_qa_chain(llm=model, chain_type="stuff", prompt=prompt)
        return chain(
            {"input_documents": docs, "question": question},
            return_only_outputs=True,
        )
