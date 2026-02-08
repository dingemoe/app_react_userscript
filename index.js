// raw GitHub-fil (kan lastes direkte)
(function () {
  const App = () =>
    React.createElement(
      "div",
      { className: "userscript-app" },
      React.createElement("h1", null, "React Userscript App")
    );

  window.UserscriptApp = App;
})();
