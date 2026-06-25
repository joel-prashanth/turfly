import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";

export default function NotFoundPage() {
  const { user } = useAuth();

  const homeHref = user?.role === "OWNER" ? "/owner/dashboard" : "/turfs";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Container className="py-20">
        <div className="mx-auto max-w-md text-center">
          <p className="text-8xl font-black text-slate-200">404</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
          <p className="mt-3 text-slate-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to={homeHref} className="mt-8 inline-block">
            <Button>Go Home</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
