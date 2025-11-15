import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqs as sqsClient } from "./sqs-client";

export class Queue {
  constructor(private queueUrl: string) {}

  async publish(message: object) {
    const body = JSON.stringify(message);

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: body,
      })
    );
  }

  async receive(maxMessages = 10, waitTimeSeconds = 10) {
    const response = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: waitTimeSeconds,
        VisibilityTimeout: 30, // 30s pra processar antes de voltar pra fila
      })
    );

    return response.Messages ?? [];
  }

  async delete(receiptHandle: string) {
    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      })
    );
  }
}
