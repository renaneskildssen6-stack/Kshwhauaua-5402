import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Gallery from "./pages/gallery";
import AssetLibrary from "./pages/asset-library";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import './gallery.css';
import './ai-buttons.css';

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/galeria"><div className="gallery-surface"><Gallery /></div></Route>
        <Route path="/assets" component={AssetLibrary} />
        <Route path="/" component={Index} />
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
