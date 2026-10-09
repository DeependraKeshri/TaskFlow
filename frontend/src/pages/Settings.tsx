import ThemeToggle from "../components/ThemeToggle";

function Settings() {
  return (
    <main className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Customize your TaskFlow experience.</p>
        </div>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Appearance</h2>
              <p>
                Choose how TaskFlow should look. System mode follows your
                device preference.
              </p>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-content">
              <h3>Theme</h3>
              <p>Choose between light, dark, or system appearance.</p>
            </div>

            <ThemeToggle />
          </div>
        </section>
      </div>
    </main>
  );
}

export default Settings;