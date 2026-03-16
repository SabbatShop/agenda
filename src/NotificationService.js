import { LocalNotifications } from '@capacitor/local-notifications';

export const setupNotifications = async () => {
  try {
    // 1. Pede permissão para mostrar notificações (Obrigatório Android 13+)
    await LocalNotifications.requestPermissions();
    
    // 2. Cria o canal de notificações (Obrigatório Android 8+)
    await LocalNotifications.createChannel({
      id: 'rotinas_tdah',
      name: 'Lembretes de Rotina',
      description: 'Avisos para beber água, tomar remédios, etc.',
      importance: 5, // 5 = Máxima (Toca som e aparece na tela)
      visibility: 1, // Visível na tela de bloqueio
      vibration: true
    });
  } catch (error) {
    console.error("Erro ao configurar notificações:", error);
  }
};

export const scheduleNextReminder = async (habitId, title, intervalMinutes) => {
  try {
    const numericId = Math.abs(habitId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));

    // Cancela a anterior
    await LocalNotifications.cancel({ notifications: [{ id: numericId }] });

    // Calcula o horário futuro
    const nextSchedule = new Date(new Date().getTime() + intervalMinutes * 60000);

    // Agenda a nova
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Hora de agir! 🎯',
          body: title,
          id: numericId,
          schedule: { 
            at: nextSchedule, 
            allowWhileIdle: true // MUITO IMPORTANTE: Funciona mesmo com o celular bloqueado/dormindo
          },
          channelId: 'rotinas_tdah', // Tem que ser o mesmo ID criado acima
        }
      ]
    });
    
    console.log(`Agendado "${title}" para ${nextSchedule.toLocaleTimeString()}`);
  } catch (error) {
    console.error("Erro ao agendar notificação:", error);
  }
};

export const cancelReminder = async (habitId) => {
  try {
    const numericId = Math.abs(habitId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));
    await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
  } catch (error) {
    console.error("Erro ao cancelar notificação:", error);
  }
};