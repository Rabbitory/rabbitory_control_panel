<a name="top">
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/rabbitory-logo.png" alt="Rabbitory Logo" width="20%"/>
</a>

# Rabbitory Control Panel

The Rabbitory Control Panel is a web-based dashboard that makes it easy to manage your self-hosted RabbitMQ instances on AWS. It’s part of the Rabbitory platform, giving you a clean and intuitive interface for provisioning new instances, updating configurations, managing plugins, and securing your setup, and more — all without leaving your browser.

---

## 🛠 Features

### Open-Source and Self-Hosted

Rabbitory gives you full control over your messaging infrastructure. Both the control panel and CLI are fully open-source, allowing you to inspect, modify, and run everything on your own terms — no black boxes, no vendor lock-in. Unlike traditional platforms that hide infrastructure details, Rabbitory helps you manage your resources directly. That means complete visibility, total control, and the freedom to scale or secure your setup however you see fit.

### Simplified Provisioning, Configuration, and Monitoring

Spin up RabbitMQ instances on AWS with just a few clicks. Configure plugins, update settings, and monitor instance details through an intuitive UI designed to streamline even the trickiest parts of RabbitMQ management.

### Smart Notifications

Stay in the loop with real-time alerts. The control panel notifies you when updates to your instance are pending, in progress, or complete — so you're never left guessing.

### Flexible Instance Sizing

Choose the instance type and storage size that best fits your workload. Whether you’re testing a small service or running production traffic, Rabbitory gives you the flexibility to scale on your terms.

---

## 📦 Prerequisites

Before gaining access to your Rabbitory Control Panel, you'll need to use the Rabbitory CLI to deploy your AWS infrastructure. Please visit the [Rabbitory CLI github repository](https://github.com/Rabbitory/rabbitory_cli) for information and instructions.

---

## 🐰 Usage

The Rabbitory Control Panel is your central hub for managing every part of your RabbitMQ instance — from creation to configuration to monitoring.

### Create a RabbitMQ Instance

Start with the New Instance Form, which walks you through provisioning a RabbitMQ server on AWS with just a few inputs.
[image from Control Panel here]

### View All Your Instances

Once launched, your instance appears on the Home Page, where you can view all your running instances at a glance, along with their real-time status. Additionally, if you no longer need an instance
[image from Control Panel here]

### View Details for a RabbitMQ Instance

Each instance has a General Page that gives you everything you need to start sending and receiving messages — including your RabbitMQ endpoint, credentials, and key metadata.

Notably, this page provides you with your instance's RabbitMQ connection URL. This URL contains your username, password, server address, and virtual host, and it's what your producer and consumer applications use to connect to your RabbitMQ instance to send and receive messages.

This page additionally provides a link to the RabbitMQ Management UI, which is the built-in web interface provided by RabbitMQ.
[image from Control Panel here]

### Configure Your RabbitMQ Server

Need to tweak RabbitMQ itself? The Configuration Page lets you update your server’s configuration file directly.
[image from Control Panel here]

### Enable + Disable Plugins

The Plugins Page makes it easy to enable and manage RabbitMQ’s many plugins with just a few clicks.
[image from Control Panel here]

### Update Your Instance Hardware

Scale your infrastructure on the fly from the Hardware Page, where you can upgrade your EC2 instance type or adjust your storage.
[image from Control Panel here]

### Create Backups of Your Instance

Use the Backups Page to export RabbitMQ definitions for safe keeping and easy restores.

[image from Control Panel here]

### Manage Your Instance Firewall + RabbitMQ Server Ports

The Firewall Page lets you manage EC2 security groups and RabbitMQ protocol ports in one place — so you can stay secure without digging through the AWS console.

[image from Control Panel here]

### Monitor Server Logs

For real-time insight, the Logs Page streams live logs straight from your server.

[image from Control Panel here]

### Create Alarms to Monitor Storage and Memory

And the Alarms Page helps you stay ahead of problems by integrating with Slack to monitor CPU and disk usage.

[image from Control Panel here]

---

### 🤝 Developed By: Jacqueline Amherst | Zijin Gong | Laren Cozart | Mason Abruzzesse
