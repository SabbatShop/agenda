import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sun, Cloud, ThermometerSun, Wind, Droplets, CloudLightning, CloudSun, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';

function getWeatherInfo(code) {
  if (code === 0) return { label: 'Céu Limpo', icon: Sun };
  if (code === 1 || code === 2) return { label: 'Parcial. Nublado', icon: CloudSun };
  if (code === 3 || code === 45 || code === 48) return { label: 'Nublado', icon: Cloud };
  if (code >= 51 && code <= 67) return { label: 'Chuva', icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: 'Neve', icon: Cloud };
  if (code >= 80 && code <= 82) return { label: 'Pancadas', icon: CloudRain };
  if (code >= 95 && code <= 99) return { label: 'Tempestade', icon: CloudLightning };
  return { label: 'Variável', icon: CloudSun };
}

function getDayName(dateString) {
  const date = new Date(dateString + 'T00:00:00'); 
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffTime = date - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  const name = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function WeatherView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("Local Atual");

  const loadWeather = () => {
    setLoading(true);
    setError(null);
    let isMounted = true;

    async function fetchData(lat, lon) {
      try {
        // Reverse geocoding para pegar cidade
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await geoRes.json();
          const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || "Seu local";
          if (isMounted) setLocationName(city);
        } catch (e) {
          console.warn("Could not fetch city name:", e);
        }

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`);
        
        if (!res.ok) throw new Error("Falha ao buscar clima da API.");
        
        const data = await res.json();
        
        if (!isMounted) return;

        const currentCodeInfo = getWeatherInfo(data.current.weather_code);
        
        // Find next hours
        const currentHourIdx = data.hourly.time.findIndex(t => new Date(t) > new Date());
        const startIdx = currentHourIdx !== -1 ? currentHourIdx : 0;
        
        const hourlySlice = data.hourly.time.slice(startIdx, startIdx + 12).map((time, idx) => {
          const i = startIdx + idx;
          const dt = new Date(time);
          const timeStr = dt.getHours().toString().padStart(2, '0') + ':00';
          const info = getWeatherInfo(data.hourly.weather_code[i]);
          return {
            time: idx === 0 ? 'Agora' : timeStr,
            temp: Math.round(data.hourly.temperature_2m[i]),
            icon: info.icon,
            prob: data.hourly.precipitation_probability[i] || 0
          };
        });

        const dailySlice = data.daily.time.slice(0, 5).map((time, i) => {
          const info = getWeatherInfo(data.daily.weather_code[i]);
          return {
            day: getDayName(time),
            max: Math.round(data.daily.temperature_2m_max[i]),
            min: Math.round(data.daily.temperature_2m_min[i]),
            icon: info.icon,
            prob: data.daily.precipitation_probability_max[i] || 0
          };
        });

        setWeather({
          current: {
            temp: Math.round(data.current.temperature_2m),
            condition: currentCodeInfo.label,
            icon: currentCodeInfo.icon,
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
            uv: Math.round(data.daily.uv_index_max[0] || 0),
            max: Math.round(data.daily.temperature_2m_max[0]),
            min: Math.round(data.daily.temperature_2m_min[0]),
            rainProb: data.daily.precipitation_probability_max[0] || 0
          },
          hourly: hourlySlice,
          daily: dailySlice
        });
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    async function getUserLocation() {
      try {
        const checkPerms = await Geolocation.checkPermissions();
        if (checkPerms.location !== 'granted') {
          const requestPerms = await Geolocation.requestPermissions();
          if (requestPerms.location !== 'granted') {
            console.warn("Permissão de localização nativa negada.");
            fetchData(-23.5489, -46.6388);
            return;
          }
        }
        const position = await Geolocation.getCurrentPosition({ timeout: 10000, enableHighAccuracy: true });
        fetchData(position.coords.latitude, position.coords.longitude);
      } catch (err) {
        console.warn("Geolocalização Capacitor falhou, tentando fallback...", err);
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => fetchData(pos.coords.latitude, pos.coords.longitude),
            (e) => {
              console.warn("Geolocalização Web falhou, usando São Paulo.", e);
              fetchData(-23.5489, -46.6388); 
            },
            { timeout: 7000 }
          );
        } else {
          fetchData(-23.5489, -46.6388);
        }
      }
    }

    getUserLocation();

    return () => { isMounted = false; };
  };

  useEffect(() => {
    const cleanup = loadWeather();
    return cleanup;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 p-4 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-zinc-800 rounded-[2rem] w-full flex items-center justify-center">
          <RefreshCw className="animate-spin text-slate-400 dark:text-zinc-500" size={32} />
        </div>
        <div className="flex gap-3">
          <div className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl flex-1"></div>
          <div className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl flex-1"></div>
          <div className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl flex-1"></div>
        </div>
        <div className="h-40 bg-slate-200 dark:bg-zinc-800 rounded-[2rem] w-full"></div>
        <div className="h-48 bg-slate-200 dark:bg-zinc-800 rounded-[2rem] w-full"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-red-50 dark:bg-red-500/10 rounded-3xl m-4 border border-red-100 dark:border-red-500/20">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Ops! Algo deu errado</h3>
        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">{error || 'Não foi possível carregar os dados climáticos.'}</p>
        <button onClick={loadWeather} className="bg-red-500 text-white px-6 py-2 rounded-xl font-medium shadow-sm hover:bg-red-600 transition-colors">
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { current, hourly, daily } = weather;
  const MainIcon = current.icon;

  return (
    <div className="space-y-6 pb-4">
      <header className="px-1 mt-2 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Clima</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Previsão sincronizada na hora.</p>
        </div>
        <button onClick={loadWeather} className="p-2 -mb-1 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" title="Atualizar">
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center text-center"
      >
        <div className="absolute -top-6 -right-6 p-6 opacity-20">
          <MainIcon size={160} strokeWidth={1.5} />
        </div>
        
        <div className="relative z-10 w-full">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md mb-4 mx-auto w-max tracking-wider uppercase">
            <MapPin size={14} /> {locationName}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <h2 className="text-[5.5rem] leading-none font-light tracking-tighter ml-6">{current.temp}°</h2>
          </div>
          <p className="text-xl font-medium mt-4">{current.condition}</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-blue-100 text-sm font-medium">
            <span>Mín: {current.min}°</span>
            <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
            <span>Máx: {current.max}°</span>
          </div>
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-sm p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
          <Droplets className="text-blue-500" size={24} />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chuva</span>
          <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{current.rainProb}%</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-sm p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
          <Wind className="text-teal-500" size={24} />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Vento</span>
          <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{current.wind} <span className="text-[10px] font-medium text-slate-400">km/h</span></span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-sm p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
          <ThermometerSun className="text-orange-500" size={24} />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Índice UV</span>
          <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{current.uv}</span>
        </div>
      </motion.div>

      {/* Hourly forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-sm rounded-[2rem] p-5"
      >
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 px-1">Previsão por hora</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {hourly.map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[4.5rem]">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{h.time}</span>
                <Icon size={26} className={h.prob > 30 ? "text-blue-500" : (h.icon === Sun || h.icon === CloudSun) ? "text-amber-500" : "text-slate-400"} />
                <span className="text-base font-bold text-slate-700 dark:text-slate-200">{h.temp}°</span>
                {h.prob > 0 ? <span className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">{h.prob}%</span> : <span className="text-[10px] text-transparent py-0.5">-</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Daily forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-sm rounded-[2rem] p-5"
      >
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Próximos Dias</h3>
        <div className="space-y-4 mt-2">
          {daily.map((d, i) => {
            const Icon = d.icon;
            return (
              <div key={i} className="flex items-center justify-between">
                <span className="w-16 text-sm font-semibold text-slate-600 dark:text-slate-300">{d.day}</span>
                <div className="flex items-center gap-2 w-16">
                  <Icon size={22} className={d.prob > 30 ? "text-blue-500" : "text-slate-400 dark:text-zinc-500"} />
                  {d.prob > 0 && <span className="text-xs text-blue-500 font-bold">{d.prob}%</span>}
                </div>
                <div className="flex items-center gap-3 w-28 justify-end">
                  <span className="text-sm font-medium text-slate-400 w-6 text-right">{d.min}°</span>
                  <div className="w-12 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-blue-300 to-orange-400 w-full rounded-full"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-6">{d.max}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
