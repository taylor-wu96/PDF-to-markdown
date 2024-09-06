import React from "react";
import { useState,useEffect } from "react";
// import { useLocation } from 'react-router-dom';

import "preline/preline";
import { IStaticMethods } from "preline/preline";
import PdfProcessor from "./PdfProcessor";
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}

function App() {
  // const location = useLocation();

  useEffect(() => {
    window.HSStaticMethods.autoInit();
  }, []);

	const [count, setCount] = useState(0);

	return (
		<div className="App">
      <PdfProcessor/>
		</div>
	);
}

export default App;
