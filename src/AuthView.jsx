import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!isLoginMode && password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        // Modo Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Bem-vindo de volta! ⚡');
        onLoginSuccess(data.user);
      } else {
        // Modo Cadastro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Conta criada! Verifique seu e-mail para confirmar. 📧', { duration: 5000 });
        setIsLoginMode(true); 
      }
    } catch (error) {
      toast.error(error.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-6 transition-colors duration-300">
      
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 mb-6">
          <LayoutDashboard size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 mb-2">
          Agenda TDAH
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs">
          Sincronize sua rotina, hábitos e energia em todos os seus dispositivos.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-8 rounded-3xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-8 font-sans text-center">
          {isLoginMode ? 'Acessar Conta' : 'Criar Nova Conta'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
              E-mail
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-indigo-500 transition-colors dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
              Senha
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-indigo-500 transition-colors dark:text-white"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLoginMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!isLoginMode}
                  minLength={6}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-indigo-500 transition-colors dark:text-white"
                />
              </div>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <span className="animate-pulse">Aguarde...</span>
            ) : isLoginMode ? (
               <><LogIn size={20} /> Entrar</>
            ) : (
               <><UserPlus size={20} /> Cadastrar</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-zinc-800 pt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoginMode ? "Ainda não tem uma conta?" : "Já tem conta criada?"}
          </p>
          <button 
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setPassword('');
              setConfirmPassword('');
            }}
            className="mt-2 text-indigo-500 hover:text-indigo-600 font-bold tracking-wide transition-colors"
          >
            {isLoginMode ? "Criar meu espaço agora" : "Fazer login na minha conta"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
