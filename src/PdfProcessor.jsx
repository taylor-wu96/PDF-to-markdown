import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { marked } from 'marked';

const PdfProcessor = () => {
  const [pluginStatus, setPluginStatus] = useState({
    markerPdf: 'Unknown',
    ocrmypdf: 'Unknown',
    torch: 'Unknown',
    pdftk: 'Unknown',
  });
  const [file, setFile] = useState(null);
  const [outputPrefix, setOutputPrefix] = useState('');
  const [pagesPerChunk, setPagesPerChunk] = useState(0);
  const [maxPages, setMaxPages] = useState(0);
  const [languages, setLanguages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  
  let server_url = ''; // You'll retrieve this dynamically

  const getServerUrl = async () => {
    if (!server_url) {
      // Call Electron API or another service to retrieve server address
      server_url = await window.electronAPI.getServerAddress();
      console.log('Server URL:', server_url);
    }
    return server_url;
  };

  const handlePluginCheck = async () => {
    const url = await getServerUrl();
    const response = await axios.get(`${url}/check-plugins`);
    setPluginStatus({
      markerPdf: response.data.markerPdf,
      ocrmypdf: response.data.ocrmypdf,
      torch: response.data.torch,
      pdftk: response.data.pdftk,
    });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('outputPrefix', outputPrefix);
    formData.append('pagesPerChunk', pagesPerChunk);
    formData.append('maxPages', maxPages);
    formData.append('languages', languages.join(','));

    setResult('Processing...');
    setProgress(0);

    try {
      const url = await getServerUrl();
      const response = await axios.post(`${url}/process-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const taskId = response.data.taskId;
      pollProgress(taskId);
    } catch (error) {
      setResult('Error: ' + error.message);
    }
  };

  const pollProgress = async (taskId) => {
    const url = await getServerUrl();
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${url}/progress/${taskId}`);
        if(progress!==response.data.progress)
        {
          fetchResult(taskId);
          setProgress(response.data.progress);
        }
       
  
        if (response.data.progress >= 100) {
          clearInterval(intervalId);
          fetchResult(taskId);
        }
      } catch (error) {
        clearInterval(intervalId); // Ensure we stop polling if there's an error
        setResult('Error processing PDF: ' + error.message);
      }
    }, 1000); // Poll every 1 second
  };
  
  const fetchResult = async (taskId) => {
    try {
      const url = await getServerUrl();
      const response = await axios.get(`${url}/download/${outputPrefix}_final_output.md`);
      let markdownContent = response.data;

      // Adjust the image paths using regex
      markdownContent = markdownContent.replace(
        new RegExp(`!\\[.*?\\]\\(\\.\\/${outputPrefix}_combined_images\\/(.*?)\\)`, 'g'),
        (match, p1) => `![${p1}](${url}/picture?filename=${p1}&relativePath=${outputPrefix}_combined_images)`
      );

      setHtmlContent(marked.parse(markdownContent));
      setResult('Processing complete!');
    } catch (error) {
      setResult('Error fetching result: ' + error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const url = await getServerUrl();
      const response = await axios.get(`${url}/zip/${outputPrefix}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${outputPrefix}.zip`;
      link.click();
    } catch (error) {
      setResult('Error downloading file: ' + error.message);
    }
  };

  return (
    <div className='relative'>

      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="text-center">
          <h2 className="text-xl text-gray-800 font-bold sm:text-3xl dark:text-white">PDF Processor</h2>
        </div>
        <div className="mt-5 p-4 relative z-10 bg-white border rounded-xl sm:mt-10 md:p-10 dark:bg-neutral-900 dark:border-neutral-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 sm:mb-8">
              <label htmlFor="pdfFile" className="sr-only">Choose PDF file</label>
              <input
                type="file"
                id='pdfFile'
                accept=".pdf"
                required
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:disabled:opacity-50 file:disabled:pointer-events-none dark:text-neutral-500 dark:file:bg-blue-500 dark:hover:file:bg-blue-400" />
            </div>
           
            <div className="mb-4 sm:mb-8">
              <label
                htmlFor="outputPrefix"
                className="block mb-2 text-sm font-medium dark:text-white"
                >OutputDirectory</label>
              <input
                onChange={(e) => setOutputPrefix(e.target.value)}
                type="text"
                id='outputPrefix'
                placeholder="Output Prefix"
                required
                className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
            </div>

            <div className="mb-4 sm:mb-8">
              <label
                htmlFor="pagesPerChunk"
                className="block mb-2 text-sm font-medium dark:text-white"
                >Pages</label>
              <input
                onChange={(e) => setPagesPerChunk(e.target.value)}
                type="number"
                id='pagesPerChunk'
                placeholder="Pages per Chunk"
                required
                className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
            </div>

            <div className="mb-4 sm:mb-8">
              <label
                htmlFor="maxPages"
                className="block mb-2 text-sm font-medium dark:text-white">
                Max Pages</label>
              <input
                type="number"
                id='maxPages'
                onChange={(e) => setMaxPages(e.target.value)}
                placeholder="Max Pages (0 for no limit)"
                required
                className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
            </div>

            <div className="mb-4 sm:mb-8">
              <select
                value={languages} onChange={(e) => setLanguages([...e.target.selectedOptions].map(o => o.value))}
                data-hs-select='{
                "placeholder": "Language Preference...",
                "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
                "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-neutral-600",
                "dropdownClasses": "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700",
                "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800",
                "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-600 dark:text-blue-500 \" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>",
                "extraMarkup": "<div clas=\"absolute top-1/2 end-3 -translate-y-1/2\"><svg class=\"shrink-0 size-3.5 text-gray-500 dark:text-neutral-500 \" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div>"
              }'
              className="hidden">
                <option value="">Choose</option>
                <option value="english">English</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>
            <div className="mt-6 grid">
              <button
                type="submit"
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                Process PDF
              </button>
            </div>
          </form>
        </div>

        <div className="max-w-[65rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          <div className="mx-auto max-w-2xl">
          <div className="mb-4 sm:mb-8">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Progress Ratio</h3>
              <span className="text-sm text-gray-800 dark:text-white">{progress}%</span>
            </div>
            <div
              className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500 dark:bg-blue-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
            <div>{result}</div>

            <div className="mt-4 sm:mt-8">
              <button  onClick={handleDownload} type="button" id="downloadZip"  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
                Download Markdown
              </button>
            </div>

              <div className="mt-4 sm:mt-8 hs-accordion-group">
                <div className="hs-accordion hs-accordion-active:bg-gray-100 rounded-xl p-6 dark:hs-accordion-active:bg-white/10 active" id="hs-basic-with-title-and-arrow-stretched-heading-one">
                  <button className="hs-accordion-toggle group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-start text-gray-800 rounded-lg transition hover:text-gray-500 focus:outline-none focus:text-gray-500 dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400" aria-expanded="true" aria-controls="hs-basic-with-title-and-arrow-stretched-collapse-one">
                  Rendered Markdown
                    <svg className="hs-accordion-active:hidden block shrink-0 size-5 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    <svg className="hs-accordion-active:block hidden shrink-0 size-5 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <div id="hs-basic-with-title-and-arrow-stretched-collapse-one" className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region" aria-labelledby="hs-basic-with-title-and-arrow-stretched-heading-one">
                    <article className="prose lg:prose-xl mx-auto mt-8" id="download" dangerouslySetInnerHTML={{ __html: htmlContent }}>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hs-tooltip [--trigger:hover] inline-block fixed z-50 fixed-bottom-0 right-[32px] top-[32px]">
          <div className="hs-tooltip-toggle block text-center">
            <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold px-6 py-2 border border-transparent text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400 rounded-full bg-slate-50">
              Plugin Status
            </button>
            <div className="hs-tooltip-content p-4 hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible hidden opacity-0 transition-opacity absolute invisible z-10 max-w-xs bg-white border border-gray-100 text-start rounded-lg shadow-md dark:bg-neutral-800 dark:border-neutral-700" role="tooltip">
              <div className="py-3 px-4 text-sm text-gray-600 dark:text-neutral-400">
                <div className="mt-4">
                  <h3 className="text-m font-semibold">Plugin Status</h3>
                  <ul id="pluginStatus" className="list-disc pl-5 text-gray-800 dark:text-white">
                    <li>marker-pdf: <span>{pluginStatus.markerPdf}</span></li>
                    <li>ocrmypdf: <span>{pluginStatus.ocrmypdf}</span></li>
                    <li>torch: <span>{pluginStatus.torch}</span></li>
                    <li>pdftk: <span>{pluginStatus.pdftk}</span></li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 grid">
                <button
                  type="button"
                  id="checkPlugins"
                  onClick={handlePluginCheck}  // Corrected here
                  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700">
                  Check Required Plugins
                </button>

              </div>
            </div>
          </div>
        </div>

    </div>

  );
};

export default PdfProcessor;
