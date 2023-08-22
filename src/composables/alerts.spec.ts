import { useAlerts, UniqueAlert, AlertType } from '@/composables/alerts'; // Replace with the actual path
import { beforeEach, vi } from 'vitest';

describe('useAlerts', () => {
  beforeEach(() => {
    const { alerts } = useAlerts();
    alerts.splice(0, alerts.length);
  });

  it('adds a new alert', () => {
    const { add, alerts } = useAlerts();
    const alertDetails = {
      type: 'info' as AlertType,
      title: 'Test Alert',
      message: 'This is a test alert.',
    };

    const addedAlert = add(alertDetails);
    expect(alerts.length).toBe(1);
    expect(addedAlert).toBeInstanceOf(UniqueAlert);
  });

  it('adds an error alert', () => {
    const { error, alerts } = useAlerts();
    const fakeError = new Error('Fake error');

    const addedAlert = error('Error Title', fakeError);
    expect(alerts.length).toBe(1);
    expect(addedAlert).toBeInstanceOf(UniqueAlert);
  });

  it('removes all alerts', () => {
    const { add, removeAll, alerts } = useAlerts();
    const alertDetails = {
      type: 'danger' as AlertType,
      title: 'Test Alert',
    };

    add(alertDetails);
    add(alertDetails);

    expect(alerts.length).toBe(2);

    removeAll();
    expect(alerts.length).toBe(0);
  });

  it('removes an alert after the timeout', async () => {
    vi.useFakeTimers();
    const { add, alerts } = useAlerts();
    const alertDetails = {
      type: 'warning' as AlertType,
      title: 'Test Alert',
    };

    add(alertDetails);
    expect(alerts.length).toBe(1);

    vi.advanceTimersByTime(5000); // 5 seconds - the default timeout

    expect(alerts.length).toBe(0);
    vi.useRealTimers();
  });

  it('removes an alert after calling the remove function', () => {
    const { add, alerts } = useAlerts();
    const alertDetails = {
      type: 'success' as AlertType,
      title: 'Test Alert',
    };

    const addedAlert = add(alertDetails);
    expect(alerts.length).toBe(1);

    addedAlert.remove();
    expect(alerts.length).toBe(0);
  });
});
