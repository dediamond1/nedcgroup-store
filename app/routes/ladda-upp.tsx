import { useState, useCallback, useEffect } from "react";
import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Outlet, Link, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, AlertCircle, CheckCircle, Package, X } from 'lucide-react';
import { getSession } from "../utils/sessions.server";
import { baseUrl } from "~/constants/api";

interface Article {
  _id: string;
  articleId: string;
  name: string;
}

interface FileContent {
  lines: string[];
  totalLines: number;
  totalLength: number;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get('token');
    if (!token) {
      return redirect('/');
    }

    const response = await fetch(`${baseUrl}/api/subcategory/lyca/articles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw json({ message: "Failed to fetch articles" }, { status: response.status });
    }

    const data = await response.json();
    return json(data.articallist);
  } catch (error) {
    console.error("Loader error:", error);
    throw json({ message: "An error occurred while fetching data" }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get('token');
    if (!token) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const selectedArticle = formData.get("articleId");
    const fileContent = formData.get("fileContent") as any;
    const articleName = formData.get("articleName") as string;
    
    if (!selectedArticle || !fileContent) {
      return json({ error: "Vouchers finns redan" }, { status: 400 });
    }

    const response = await fetch(`${baseUrl}/api/vouchers`, {
      method: 'POST',
      body: JSON.stringify({ articleId: selectedArticle, vouchers: JSON.parse(fileContent) }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: errorData.error || 'An error occurred while uploading vouchers' }, { status: response.status });
    }

    const result = await response.json();
    
    if (result.error === 'Duplicate vouchers found') {
      return json({ error: 'Dubletter av koder hittades i filen' }, { status: 400 });
    }
    
    return json({ success: true, articleName });
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};

export default function UploadPage() {
  const articles = useLoaderData<Article[]>();
  const [selectedArticle, setSelectedArticle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fetcher = useFetcher() as any;

  const resetForm = useCallback(() => {
    setFile(null);
    setFileContent(null);
    setSelectedArticle("");
  }, []);

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccess(true);
      resetForm();
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [fetcher.data, resetForm]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split('\n').map(line => line.trim().replace('\r', '')).filter(line => line !== '');
        setFileContent({
          lines,
          totalLines: lines.length,
          totalLength: content.length,
        });
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArticle && fileContent) {
      setIsModalOpen(true);
    } else {
      alert("Välj en artikel och ladda upp en fil.");
    }
  }, [selectedArticle, fileContent]);

  const confirmUpload = useCallback(() => {
    if (fileContent) {
      const formData = new FormData();
      formData.append("articleId", selectedArticle);
      const selectedArticleName = articles.find(a => a.articleId === selectedArticle)?.name;
      formData.append("articleName", selectedArticleName || "");
      const cleanLines = fileContent.lines.map(line => line.replace('\r', ''));
      formData.append("fileContent", JSON.stringify(cleanLines));
      fetcher.submit(formData, { method: "post" });
      setIsModalOpen(false);
    }
  }, [articles, fetcher, fileContent, selectedArticle]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link to="/lager" className="text-3xl font-bold">Nedcgroup Lager</Link>
            <nav className="flex space-x-6">
              <Link to="/lager" className="text-white hover:text-indigo-200 transition font-medium flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Lager
              </Link>
              <Link to="/ladda-upp" className="text-white hover:text-indigo-200 transition font-medium flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Fyll På
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Ladda upp artikelfil</h2>
            
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md flex items-center justify-between"
                  role="alert"
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                    <span className="text-green-700 font-medium">Filen har laddats upp för artikel: {fetcher.data?.articleName}</span>
                  </div>
                  <button onClick={() => setShowSuccess(false)} className="text-green-700 hover:text-green-900">
                    <X className="h-5 w-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <label htmlFor="article" className="block text-lg font-medium text-gray-700 mb-2">
                  Välj artikel
                </label>
                <select
                  id="article"
                  value={selectedArticle}
                  onChange={(e) => setSelectedArticle(e.target.value)}
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                >
                  <option value="">Välj en artikel</option>
                  {articles.map((article) => (
                    <option key={article._id} value={article.articleId}>
                      {article.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedArticle && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                  <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-2">
                    Ladda upp textfil
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Ladda upp en fil</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt" />
                        </label>
                        <p className="pl-1">eller dra och släpp</p>
                      </div>
                      <p className="text-xs text-gray-500">TXT upp till 10MB</p>
                    </div>
                  </div>
                </div>
              )}

              {fileContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Filstatistik</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-8">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Antal rader</dt>
                      <dd className="mt-1 text-2xl font-semibold text-indigo-600">{fileContent.totalLines}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Total längd</dt>
                      <dd className="mt-1 text-2xl font-semibold text-indigo-600">{fileContent.totalLength} tecken</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Förhandsgranskning (första 10 rader)</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
                          {fileContent.lines?.slice(0, 10).map((line, index) => (
                            <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm hover:bg-gray-50">
                              <span className="font-medium text-gray-900">{index + 1}.</span>
                              <span className="ml-2 flex-1 w-0 truncate">{line}</span>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </motion.div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={!selectedArticle || !fileContent}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Upload className="mr-2 h-6 w-6" />
                  Ladda upp
                </button>
              </div>
            </form>

            {fetcher.data?.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center"
                role="alert"
              >
                <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                <span className="text-red-700">{fetcher.data.error}</span>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed z-10 inset-0 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <motion.div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Upload className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Bekräfta uppladdning
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Är du säker på att du vill ladda upp denna fil? Detta kommer att uppdatera lagret för den valda artikeln.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmUpload}
                  >
                    Bekräfta
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Avbryt
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data.message || 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="error-container">
      <h1>An unexpected error occurred</h1>
      <p>Please try again later or contact support if the problem persists.</p>
    </div>
  );
}