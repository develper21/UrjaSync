import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="border-t py-12 bg-card">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 font-display font-bold">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        UrjaSync
      </div>
      <p className="text-sm text-muted-foreground">© 2026 UrjaSync. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
