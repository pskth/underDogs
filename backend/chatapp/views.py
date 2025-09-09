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

from .models import PDF, HistoricalFigure
from .serializers import PDFSerializer, HistoricalFigureSerializer

# Load API Key
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment.")
genai.configure(api_key=api_key)

FAISS_FOLDER_PATH = "faiss_indices"
os.makedirs(FAISS_FOLDER_PATH, exist_ok=True)


class HistoricalFigureViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Historical Figures.
    """

    queryset = HistoricalFigure.objects.all()
    serializer_class = HistoricalFigureSerializer


class PDFViewSet(viewsets.ModelViewSet):
    """
    Upload PDFs → extract text → build per-figure FAISS index → chat with historical figures.
    """

    serializer_class = PDFSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    queryset = PDF.objects.all()

    def perform_create(self, serializer):
        pdf_instance = serializer.save()
        pdf_path = pdf_instance.file.path

        # Extract text
        text = self.extract_pdf_text(pdf_path)
        if not text.strip():
            raise ValueError(f"No extractable text found in {pdf_instance.file.name}.")
        pdf_instance.text = text
        pdf_instance.save()

        # Rebuild FAISS index for the entire figure
        self.build_faiss_index_for_figure(pdf_instance.figure)

    def extract_pdf_text(self, path: str) -> str:
        reader = PdfReader(path)
        return "".join([page.extract_text() or "" for page in reader.pages])

    def split_text_into_chunks(self, text: str):
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        return splitter.split_text(text)

    def build_faiss_index_for_figure(self, figure: HistoricalFigure):
        """
        Combine all PDFs for this figure and build a single FAISS index.
        """
        all_chunks = []
        for pdf in figure.pdfs.all():
            if pdf.text:
                all_chunks += self.split_text_into_chunks(pdf.text)

        if not all_chunks:
            raise ValueError(f"No text chunks found for figure {figure.name}.")

        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.from_texts(all_chunks, embeddings)

        path = os.path.join(FAISS_FOLDER_PATH, f"faiss_figure_{figure.id}")
        vector_store.save_local(path)

    @action(detail=False, methods=["post"], url_path="chat")
    def chat_with_figure(self, request):
        figure_id = request.data.get("figure_id")
        question = request.data.get("question", "").strip()

        if not figure_id or not question:
            return Response(
                {"error": "figure_id and question are required."}, status=400
            )

        try:
            figure = HistoricalFigure.objects.get(id=figure_id)
        except HistoricalFigure.DoesNotExist:
            return Response({"error": "Figure not found."}, status=404)

        # Load FAISS index
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        index_path = os.path.join(FAISS_FOLDER_PATH, f"faiss_figure_{figure.id}")

        if not os.path.exists(index_path):
            return Response({"error": "No index found for this figure."}, status=404)

        vector_db = FAISS.load_local(
            index_path, embeddings, allow_dangerous_deserialization=True
        )
        docs = vector_db.similarity_search(question, k=3)

        if not docs:
            return Response({"answer": "No relevant information found."}, status=200)

        response = self.run_qa_chain(docs, question, figure)
        return Response({"answer": response["output_text"]}, status=200)

    def run_qa_chain(self, docs, question: str, figure: HistoricalFigure):
        figure_style = figure.description or figure.name
        prompt_template = f"""
You are {figure_style}. Answer questions in their style and knowledge.
Answer the question based only on the provided context. 
If the context is not enough, reply: 
"The answer is not available in the provided context."

Context:
{{context}}

Question:
{{question}}

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
            {"input_documents": docs, "question": question}, return_only_outputs=True
        )
