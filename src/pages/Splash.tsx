import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/start');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-secondary flex items-center justify-center overflow-hidden">
      <div className="text-center space-y-6 animate-fade-in">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-background rounded-3xl shadow-2xl flex items-center justify-center animate-bounce-slow">
            <div className="text-6xl animate-pulse">🇬🇧</div>
          </div>
          <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl animate-pulse" />
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-background animate-slide-up">
            Easy UK
          </h1>
          <p className="text-lg text-background/80 animate-slide-up animation-delay-200">
            Your assistant for life in the UK
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center space-x-2 animate-fade-in animation-delay-500">
          <div className="w-2 h-2 bg-background rounded-full animate-bounce animation-delay-0" />
          <div className="w-2 h-2 bg-background rounded-full animate-bounce animation-delay-100" />
          <div className="w-2 h-2 bg-background rounded-full animate-bounce animation-delay-200" />
        </div>
      </div>
    </div>
  );
}
