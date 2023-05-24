import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

const Layout = ({ account, setAccount }) => {
  return (
      <div>
        <Navigation account={account} setAccount={setAccount} />

        <Outlet/>
      </div>
  );
}

export default Layout;
