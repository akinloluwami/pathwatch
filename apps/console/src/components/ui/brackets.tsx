import React from "react";

const Brackets = () => {
  return (
    <>
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none"></span>
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white pointer-events-none"></span>
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white pointer-events-none"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none"></span>
    </>
  );
};

export default Brackets;
