import { ReactElement, ReactNode } from "react";
import NavigationBar from "./navbar";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
	  <div style={{width: "100%"}}>
		<NavigationBar/>
		<main>{children}</main>
	  </div>
	)
  }