const Loader = () => {
  return (
    <>
      <div className="position-absolute d-flex justify-content-center align-items-center h-100 w-100" style={{ backgroundColor: "rgba(255,255,255,1)", zIndex: 999 }}>
        <div className="spinner-border" role="status" style={{ color: "#000000" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );
};

export default Loader;
