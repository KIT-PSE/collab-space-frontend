import { reactive } from 'vue';

export type AlertType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

/**
 * Interface defining the structure of an object representing an alert message.
 * @property type - The type of the alert.
 * @property title - The title of the alert.
 * @property message - The message of the alert.
 */
export interface Alerts {
  type: AlertType;
  title: string;
  message?: string;
}

const alerts: UniqueAlert[] = reactive([]);

/**
 * Represents an individual unique alert message with an auto-removal feature.
 */
export class UniqueAlert implements Alerts {
  private static idCounter = 0;

  public readonly id: number;
  public readonly type: AlertType;
  public readonly title: string;
  public readonly message?: string;

  /**
   * Creates a new instance of the UniqueAlert class with the specified alert details.
   * The alert will be automatically removed after a specified duration (default is 5000 milliseconds).
   *
   * @param alert An object containing the details of the alert message:
   *              - type: The type of the alert, indicating its category, such as "success," "error," "info," etc.
   *              - title: The title or brief description of the alert.
   *              - message: An optional detailed message or additional information related to the alert.
   */
  constructor(alert: Alerts) {
    this.id = UniqueAlert.idCounter++;
    this.type = alert.type;
    this.title = alert.title;
    this.message = alert.message;

    this.removeAfter(5000);
  }

  /**
   * Removes the alert after the specified duration in milliseconds.
   *
   * @param duration The duration in milliseconds after which the alert will be removed.
   *                 If the duration is greater than 0, the `remove()` method will be called after the specified duration.
   */
  public removeAfter(duration: number): void {
    if (duration > 0) {
      setTimeout(this.remove.bind(this), duration);
    }
  }

  /**
   * Removes the current alert from the alerts array.
   * This method is typically called after the alert has been displayed and is no longer needed.
   * If the alert is not found in the alerts array, nothing is done.
   */
  public remove(): void {
    const index = alerts.findIndex((alert) => alert.id === this.id);

    if (index === -1) {
      return;
    }

    alerts.splice(index, 1);
  }
}

/**
 * A hook to manage and display alert messages.
 * @returns An object containing functions to interact with alert messages.
 */
export function useAlerts() {
  /**
   * Adds an alert to the alerts array. If the alert is not a UniqueAlert instance,
   * a new UniqueAlert instance is created before adding it to the array.
   *
   * @param alert - The alert to be added. It can be either an instance of UniqueAlert or an object containing alert details.
   * @returns The added UniqueAlert instance.
   */
  function add(alert: Alerts | UniqueAlert): UniqueAlert {
    const uniqueAlert =
      alert instanceof UniqueAlert ? alert : new UniqueAlert(alert);
    alerts.push(uniqueAlert);
    return uniqueAlert;
  }

  /**
   * Creates a factory function that can be used to quickly add alerts of a specific type.
   *
   * @param type - The type of the alert to be added.
   * @returns A factory function that accepts the title and optional message as parameters and adds an alert of the specified type.
   */
  function addFactory(type: AlertType) {
    return (title: string, message?: string): UniqueAlert =>
      add({ type, title, message });
  }

  /**
   * Removes all alerts from the alerts array.
   */
  function removeAll() {
    alerts.splice(0, alerts.length);
  }

  /**
   * Adds an error alert with the specified title and displays the error details in the message.
   *
   * @param title - The title of the error alert.
   * @param error - The error object containing details of the error.
   * @returns The added UniqueAlert instance for the error alert.
   */
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
