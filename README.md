<a name="top">
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/rabbitory-logo.png" alt="Rabbitory Logo" width="20%"/>
</a>

# Rabbitory Control Panel

The Rabbitory Control Panel is a self-hosted, web-based interface for managing your RabbitMQ instances on AWS. It lets you easily provision new instances, update configurations, manage plugins, and secure your setup, all from your browser. With everything in one place, Rabbitory makes it simple to take control of your messaging infrastructure.

---

## 🛠 Features

### Open-Source and Self-Hosted

RabbitMQ is a widely used open-source message broker, and Rabbitory is a natural extension of that philosophy. As an open-source management tool, the Rabbitory Control Panel runs on an EC2 instance in your own AWS environment, giving you a fully transparent and self-hosted way to manage your infrastructure.

### One-Click RabbitMQ Provisioning

Spin up production-ready RabbitMQ instances on AWS in just a few clicks. Rabbitory handles the underlying EC2 provisioning, security group setup, and instance initialization, so you can go from zero to running in minutes—no manual setup required.

### RabbitMQ-as-a-Service

Once your new instance is ready, the Control Panel gives you a complete set of tools to manage it. You can change RabbitMQ configurations, enable plugins, upgrade your EC2 hardware and storage, manage firewall rules, and montior performance with logs and alarms.Rabbitory gives you full visibility into your setup so you can monitor your message queues and keep your system running smoothly.

### Smart UI Notifications

The Control Panel keeps you informed with real-time alers for all instance operations. Whether an update is pending, in progress, successful, or has failed, you’ll see immediate feedback right in the UI. This helps you stay aware of what’s happening in your messaging infrastructure — so you're never left guessing.

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

### View All Your Instances

Once launched, your instance appears on the Home Page, where you can view all your running instances at a glance, along with their real-time status. Additionally, if you no longer need an instance, you can easily terminate it directly from the same page with just a few clicks.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/instances-page" alt="All Instances Page"/>
</p>

### View Details for a RabbitMQ Instance

Each instance has a General Page that gives you everything you need to start sending and receiving messages — including your RabbitMQ endpoint, credentials, and key metadata.

Notably, this page provides you with your instance's RabbitMQ connection URL. This URL contains your username, password, server address, and virtual host, and it's what your producer and consumer applications use to connect to your RabbitMQ instance to send and receive messages.

This page additionally provides a link to the RabbitMQ Management UI, which is the built-in web interface provided by RabbitMQ.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/instance-details" alt="Instance Details"/>
</p>

### Configure Your RabbitMQ Server

Need to tweak RabbitMQ itself? The Configuration Page lets you update your server’s configuration file directly.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/config-page.png" alt="Configuration Page"/>
</p>

### Enable + Disable Plugins

The Plugins Page makes it easy to enable and manage RabbitMQ’s variety of plugins with simple toggles.

### Update Your Instance Hardware

Scale your infrastructure on the fly from the Hardware Page to upgrade your EC2 instance type or adjust your storage.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/hardware-page.png" alt="Hardware Page"/>
</p>

### Create Backups of Your Instance

Use the Backups Page to create and export RabbitMQ definitions for safe keeping, restores, and migrations.

### Manage Your Instance Firewall + RabbitMQ Server Ports

The Firewall Page allows you to manage EC2 security groups and RabbitMQ protocol ports in one place. You can name firewall rules, define source IPs using CIDR blocks, and open specific ports—all without having to navigate through the AWS console or RabbitMQ server.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/firewall-page.png" alt="Firewall Page"/>
</p>

### Monitor Server Logs

For real-time insight, the Logs Page streams live logs straight from your server.

### Create Alarms to Monitor Storage and Memory

The Alarms Page keeps you informed by notifying you in your Slack workspace about critical CPU and disk usage metrics, helping you stay ahead of potential issues.

---

The Rabbitory Control Panel provides a powerful, intuitive interface for managing RabbitMQ instances on AWS. With features like one-click provisioning, real-time notifications, easy plugin management, and comprehensive firewall controls, it streamlines the complexities of RabbitMQ management. Whether you're monitoring performance, configuring instances, or setting alarms, Rabbitory offers full visibility and control—all from a clean, browser-based dashboard.

---

### 🤝 Developed By: Jacqueline Amherst | Zijin Gong | Laren Cozart | Mason Abruzzesse
