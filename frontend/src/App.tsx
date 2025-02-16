import {
  Dropdown,
  Option,
  Persona,
  Textarea,
  useId,
} from "@fluentui/react-components";
import classes from "./App.module.css";
import TreeView from "./components/tree-viewer";
import TabViewer from "./components/tab-viewer/tab-viewer";

function App() {
  const dropdownId = useId("dropdown");
  return (
    <div className={classes.container}>
      <div className={classes.sidebar}>
        <Dropdown id={dropdownId}>
          <Option text="Katri Athokas">
            <Persona
              avatar={{ color: "colorful", "aria-hidden": true }}
              name="Katri Athokas"
              presence={{
                status: "available",
              }}
              secondaryText="Available"
            />
          </Option>
        </Dropdown>
        <TreeView />
      </div>
      <div className={classes.main}>
        <div className={classes.details}>
          <TabViewer />
        </div>
        <div className={classes.search}>
          <Textarea
            style={{ width: "100%", height: "100%" }}
            placeholder="Enter custom LDAP Search"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
