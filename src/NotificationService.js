import { LocalNotifications } from '@capacitor/local-notifications';

export const requestNotificationPermission = async () => {
  // Solicita permissão do usuário para enviar notificações (obrigatório no Android 13+)
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
};

export const scheduleNextReminder = async (habitId, title, intervalMinutes) => {
  // Cria um ID numérico único baseado no ID do hábito (o Android exige IDs numéricos)
  const numericId = Math.abs(habitId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));

  // Primeiro, cancela qualquer notificação pendente deste mesmo hábito para não acumular
  await LocalNotifications.cancel({ notifications: [{ id: numericId }] });

  // Calcula o horário futuro com base no intervalo escolhido
  const nextSchedule = new Date(new Date().getTime() + intervalMinutes * 60000);

  // Programa a notificação no celular
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Hora de agir!',
        body: title,
        id: numericId,
        schedule: { at: nextSchedule },
        smallIcon: 'ic_stat_icon_config_sample', // ícone padrão do android
      }
    ]
  });
  
  console.log(`Notificação "${title}" agendada para ${nextSchedule.toLocaleTimeString()}`);
};

export const cancelReminder = async (habitId) => {
  const numericId = Math.abs(habitId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));
  await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
};