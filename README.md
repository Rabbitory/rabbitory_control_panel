<a name="top">
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/rabbitory-logo.png" alt="Rabbitory Logo" width="20%"/>
</a>

# Rabbitory Control Panel

The Rabbitory Control Panel is a self-hosted, web-based interface for managing your RabbitMQ instances on AWS. Easily provision new instances, update configurations, manage plugins, and secure your setup, all from the browser. With everything in one place, Rabbitory makes it simple to take control of your messaging infrastructure.

---

## 🛠 Features

### Open-Source and Self-Hosted

RabbitMQ is a widely used open-source message broker, and Rabbitory is a natural extension of that philosophy. As an open-source management tool, the Rabbitory Control Panel runs on an EC2 instance in your own AWS environment, giving you a fully transparent and self-hosted way to manage your infrastructure.

### One-Click RabbitMQ Provisioning

Spin up production-ready RabbitMQ instances on AWS in just a few clicks. Rabbitory handles the underlying EC2 provisioning, security group setup, and instance initialization, so you can go from zero to running in minutes — no manual setup required.

### RabbitMQ-as-a-Service

Once a new instance is ready, the Control Panel gives you a complete set of tools to manage it. Change RabbitMQ configurations, enable plugins, upgrade EC2 hardware and storage, manage firewall rules, and montior performance with logs and alarms. Rabbitory provides full visibility into your setup to monitor your message queues and keep your system running smoothly.

### Smart Badge Notifications

The Control Panel keeps you informed with real-time alers for all instance operations. Whether an update is pending, in progress, successful, or has failed, you’ll see an immediate badge notification appear by the bell icon at the top of your Control Panel. This helps you stay aware of what’s happening in your messaging infrastructure — so you're never left guessing.

### Flexible Instance Sizing

Choose the instance type and storage size that best fits your workload. Whether you’re testing a small service or running production traffic, Rabbitory gives you the flexibility to scale on your terms.

## 📦 Prerequisites

Before gaining access to the Rabbitory Control Panel, use the Rabbitory CLI to deploy your AWS infrastructure. Please visit the [Rabbitory CLI github repository](https://github.com/Rabbitory/rabbitory_cli) for information and instructions.

## 🐰 Usage

The Rabbitory Control Panel is the central hub for managing every part of your RabbitMQ instance — from creation to configuration to monitoring. Rabbitory users receive a URL to their Control Panle after deploying their infrastructure with the custom cli tool. This Control Panel provides the following important features:

### Create a RabbitMQ Instance

Start with the New Instance Form, which walks you through provisioning a RabbitMQ server on AWS with just a few inputs.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/create-instance.png" alt="Create New Instance"/>
</p>

### View All RabbitMW Instances

Once launched, the RabbitMQ instance appears on the Home Page, where you can view all running instances at a glance, along with their real-time status. Additionally, when an instance is no longer needed, easily terminate it directly from the same page with just a few clicks.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/instances-page.png" alt="All Instances Page"/>
</p>

### View Details for a RabbitMQ Instance

Each instance has a General Page that provides everything you need to start sending and receiving messages — including the RabbitMQ endpoint, credentials, and key metadata.

Notably, this page exposes the instance's RabbitMQ connection URL. This URL contains the username, password, server address, and virtual host for the RabbitMQ instance. This endpoint is what producer and consumer applications will use to connect to the RabbitMQ instance for sending and receiving messages.

This page additionally provides a link to the RabbitMQ Management UI, which is the built-in web interface provided by RabbitMQ.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/instance-details.png" alt="Instance Details"/>
</p>

### Configure RabbitMQ Servers

Need to tweak RabbitMQ itself? The Configuration Page lets you update the server’s configuration file directly.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/config-page.png" alt="Configuration Page"/>
</p>

### Enable + Disable Plugins

The Plugins Page makes it easy to enable and manage RabbitMQ’s variety of plugins with simple toggles.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/plugins-page.png" alt="Plugins Page"/>
</p>

### Update Instance Hardware

Scale infrastructure on the fly from the Hardware Page to upgrade your EC2 instance type or adjust storage.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/hardware-page.png" alt="Hardware Page"/>
</p>

### Create Backups of Your Instance

Use the Backups Page to create and export RabbitMQ definitions for safe keeping, restores, and migrations.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/backups-page.png" alt="Backups Page"/>
</p>

### Manage Instance Firewall Rules + RabbitMQ Server Ports

The Firewall Page manages EC2 security groups and RabbitMQ protocol ports in one place. Name firewall rules, define source IPs using CIDR blocks, and open specific ports—all without having to navigate through the AWS console or RabbitMQ server.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/firewall-page.png" alt="Firewall Page"/>
</p>

### Monitor Server Logs

For real-time insight, the Logs Page streams live logs straight from your server.

### Create Alarms to Monitor Storage and Memory

The Alarms Page keeps your team informed by providing notifications in your Slack workspace about critical CPU and disk usage metrics, helping you stay ahead of potential issues.

<p>
<img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_control_panel/main/assets/alarms-page.png" alt="Alarms Page"/>
</p>

---

The Rabbitory Control Panel provides a powerful, intuitive interface for managing RabbitMQ instances on AWS. With features like one-click provisioning, real-time notifications, easy plugin management, and comprehensive firewall controls, it streamlines the complexities of RabbitMQ management. Whether you're monitoring performance, configuring instances, or setting alarms, Rabbitory offers full visibility and control—all from a clean, browser-based dashboard.

---

#### 🤝 Developed By: Jacqueline Amherst | Zijin Gong | Laren Cozart | Mason Abruzzesse
