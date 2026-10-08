import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getScenarios } from "../services/scenarioService";

function ScenarioLibrary() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const data = await getScenarios();
        setScenarios(data.scenarios || []);
      } catch (err) {
        console.error("Scenario loading error:", err);
        setError("Unable to load training scenarios.");
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(scenarios.map((scenario) => scenario.category))];
  }, [scenarios]);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((scenario) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        scenario.title.toLowerCase().includes(searchText) ||
        scenario.description.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "all" || scenario.category === category;

      const matchesDifficulty =
        difficulty === "all" || scenario.difficulty === difficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [scenarios, search, category, difficulty]);

  if (loading) {
    return (
      <main className="scenario-page">
        <p>Loading training scenarios...</p>
      </main>
    );
  }

  return (
    <main className="scenario-page">
      <div className="scenario-header">
        <div>
          <p className="scenario-eyebrow">Training Library</p>
          <h1>Choose a sales scenario</h1>
          <p>
            Practice realistic customer conversations and develop your sales
            communication skills.
          </p>
        </div>

        <Link to="/dashboard" className="secondary-button">
          Back to Dashboard
        </Link>
      </div>

      <section className="scenario-filters">
        <input
          type="text"
          placeholder="Search scenarios..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </section>

      {error && <p className="scenario-error">{error}</p>}

      {!error && (
        <>
          <p className="scenario-count">
            {filteredScenarios.length} scenario
            {filteredScenarios.length !== 1 ? "s" : ""} available
          </p>

          <section className="scenario-grid">
            {filteredScenarios.map((scenario) => (
              <article className="scenario-card" key={scenario.id}>
                <div className="scenario-card-top">
                  <span className={`difficulty ${scenario.difficulty}`}>
                    {scenario.difficulty}
                  </span>

                  <span className="scenario-category">
                    {scenario.category}
                  </span>
                </div>

                <h2>{scenario.title}</h2>

                <p>{scenario.description}</p>

                <div className="scenario-competencies">
                  <strong>Skills you'll practice</strong>

                  <div className="competency-list">
                    {scenario.target_competencies?.map((competency) => (
                      <span key={competency}>{competency}</span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/scenarios/${scenario.id}`}
                  className="primary-button"
                >
                  View Scenario
                </Link>
              </article>
            ))}
          </section>

          {filteredScenarios.length === 0 && (
            <div className="scenario-empty">
              <h2>No scenarios found</h2>
              <p>Try changing your search or filters.</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default ScenarioLibrary;