# Distributed Microservices Logging with Kafka, ELK Stack & Docker

A robust, scalable, and real-time logging solution for microservices, demonstrating a complete observability pipeline using Kafka for log streaming, Elasticsearch for indexing and storage, Logstash for data processing, and Kibana for visualization. All components are orchestrated with Docker Compose.

## Architecture Overview

This diagram illustrates the flow of logs through the system:

<img width="796" height="489" alt="dockerised" src="https://github.com/user-attachments/assets/802d6775-7347-4f15-a9ba-c147d091566f" />


* **Microservices (Simulated):** Six Node.js applications generate synthetic, realistic logs (around 300 logs/minute each) representing different services (e.g., Web, Auth, User, Order, Inventory, Payment). Each log contains rich metadata like service name, log level, HTTP status, response time, user ID, country, etc.
* **Kafka:** Acts as a central, high-throughput, and fault-tolerant message broker. All microservices publish their logs to a dedicated `logs` Kafka topic.
* **Logstash:** Consumes logs from the Kafka `logs` topic, applies essential filtering and transformation (e.g., removing unneeded fields, parsing timestamps, adding tags for error logs), and then pushes the processed data into Elasticsearch.
* **Elasticsearch:** A powerful distributed search and analytics engine that stores and indexes the structured log data, making it searchable and queryable.
* **Kibana:** The visualization layer that connects to Elasticsearch, allowing for interactive exploration, analysis, and dashboard creation from the ingested logs.
* **Kafka UI:** A web-based interface for monitoring Kafka topics, messages, and consumer groups, useful for debugging the Kafka stream.


## Technologies Used

* **Backend / Log Generation:** Node.js, `kafkajs`, `faker-js`
* **Log Streaming:** Apache Kafka (using Bitnami image with KRaft)
* **Log Processing:** Logstash
* **Log Storage & Indexing:** Elasticsearch
* **Log Visualization & Analysis:** Kibana
* **Containerization & Orchestration:** Docker, Docker Compose
* **Kafka Management:** Kafka UI
* **Utility:** `wait-for-it.sh` (for service dependency management in Docker)
