
import { Routes } from "react-router-dom";
import { MainRoutes } from "./MainRoutes";
import { AuctionRoutes } from "./AuctionRoutes";
import { UserManagementRoutes } from "./UserManagementRoutes";
import { RiskManagementRoutes } from "./RiskManagementRoutes";
import { SystemRoutes } from "./SystemRoutes";

export function AppRoutes() {
  return (
    <Routes>
      <MainRoutes />
      <SystemRoutes />
      <AuctionRoutes />
      <UserManagementRoutes />
      <RiskManagementRoutes />
    </Routes>
  );
}
