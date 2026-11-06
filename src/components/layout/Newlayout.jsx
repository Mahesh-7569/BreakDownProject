import React from "react";


const Newlayout = ({ children }) => {
  return (
    <div className="flex h-screen">
     
      <div className="flex-1 flex flex-col">
     
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default Newlayout;
