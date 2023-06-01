import { reactive } from 'vue';

export type AlertType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

export interface Alerts {
  type: AlertType;
  title: string;
  message?: string;
}

const alerts: UniqueAlert[] = reactive([]);

export class UniqueAlert implements Alerts {
  private static idCounter = 0;

  public readonly id: number;
  public readonly type: AlertType;
  public readonly title: string;
  public readonly message?: string;

  constructor(alert: Alerts) {
    this.id = UniqueAlert.idCounter++;
    this.type = alert.type;
    this.title = alert.title;
    this.message = alert.message;
  }

  public removeAfter(duration: number): void {
    if (duration > 0) {
      setTimeout(this.remove.bind(this), duration);
    }
  }

  public remove(): void {
    const index = alerts.findIndex((alert) => alert.id === this.id);

    if (index === -1) {
      return;
    }

    alerts.splice(index, 1);
  }
}

export function useAlerts() {
  function add(alert: Alerts | UniqueAlert): UniqueAlert {
    const uniqueAlert =
      alert instanceof UniqueAlert ? alert : new UniqueAlert(alert);
    alerts.push(uniqueAlert);
    return uniqueAlert;
  }

  function addFactory(type: AlertType) {
    return (title: string, message?: string): UniqueAlert =>
      add({ type, title, message });
  }

  function removeAll() {
    alerts.splice(0, alerts.length);
  }

  function error(title: string, error: Error): UniqueAlert {
    console.error(error);

    if (import.meta.env.DEV) {
      return add({
        type: 'danger',
        title,
        message: `
            <pre>${error.stack}</pre>
        `,
      });
    }

    return add({
      type: 'danger',
      title,
      message: `
            Führen Sie die Aktion erneut aus. Falls dieser Fehler öfters<br>
            auftritt <b>melden</b> Sie diesen an die Entwicklung.
      `,
    });
  }

  return {
    alerts,
    add,
    error,
    removeAll,
    primary: addFactory('primary'),
    secondary: addFactory('secondary'),
    success: addFactory('success'),
    danger: addFactory('danger'),
    warning: addFactory('warning'),
    info: addFactory('info'),
  };
}
