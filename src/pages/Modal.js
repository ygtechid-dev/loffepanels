import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';


function Modal({ children, closeModal }) {
    const [html, setHtml] = useState("")
    const childs = children.props.children
    console.log('cjidd', childs.toString());

    useEffect(() => {
        setHtml(childs)
      }, [html])
  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <div className="mb-4">
        {parse(html)}

        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Modal;
