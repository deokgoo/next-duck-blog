const TableWrapper = ({ children }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max">{children}</table>
    </div>
  );
};

export default TableWrapper;
