Questions:
## What is a target group and how do they connect to everything else?

A target group in AWS (specifically with Elastic Load Balancing) is a logical grouping of resources (such as EC2 instances, IP addresses, or ECS tasks) that a load balancer routes traffic to.

Here’s how a target group connects to everything else in your CloudFormation template:

The Application Load Balancer (ALB) receives incoming traffic.
The ALB has listeners (for HTTP and HTTPS) that define rules for handling requests.
Each listener forwards or redirects traffic to a target group.
The target group contains the actual compute resources (in your case, ECS tasks running your container).
Health checks are performed by the ALB on the targets in the group to ensure only healthy resources receive traffic.
The ECS service registers its running tasks as targets in the target group, so when the ALB forwards traffic, it reaches your application containers.
In summary:
ALB → Listener → Target Group → ECS Tasks (your app)


## What is a security group and how do they connect to everything else?

A security group in AWS acts as a virtual firewall that controls inbound and outbound traffic for your resources (like EC2 instances, ECS tasks, or load balancers).

How they connect to everything else in your template:

The ALB (Application Load Balancer) is assigned a security group (ALBSecurityGroup) that allows HTTP/HTTPS traffic from the internet.
The ECS tasks (your containers) are assigned a different security group (ECSSecurityGroup) that only allows traffic from the ALB’s security group.
These security groups ensure that:
Only web traffic (ports 80/443) can reach your ALB from the internet.
Only the ALB can reach your ECS tasks on port 80.
No other traffic is allowed in or out unless explicitly permitted.
In summary:
Security groups define who can talk to your ALB and ECS tasks, acting as gatekeepers for network access.


## What is a task definition for ECS and how does it apply to service/cluster?

A task definition in ECS is like a blueprint that describes how to run your application containers. It specifies details such as:
- Which Docker image to use
- What CPU and memory to allocate
- What environment variables to set
- What ports to expose
- How to handle logging and networking

How it applies to service/cluster:
- The ECS cluster is the pool of compute resources (like a fleet of servers) where your containers run.
- The ECS service uses the task definition to launch and maintain the desired number of running containers (tasks) in the cluster.
- When you update the task definition (for example, with a new image), the service can deploy new tasks using the updated definition.

In summary: The task definition tells ECS how to run your app, the service ensures the right number of copies are running, and the cluster provides the resources to run them.

An ECS cluster can have many task definitions (and many versions of each).
Each ECS service uses exactly one task definition (and one specific revision) at a time.
You can run multiple services in the same cluster, each with its own task definition.
This allows you to deploy and manage different applications (or different versions) within the same cluster, but each service is always tied to a single task definition revision.


## When do the parameters in a cloudformation file receive values?

Parameters in a CloudFormation file receive their values when you create or update a stack. You can provide values:
- Manually, by specifying them in the AWS Console, CLI, or API when launching the stack
- Automatically, by using a parameters file or passing them as command-line arguments
If you don't provide a value, CloudFormation uses the default (if specified). These values are then substituted wherever the parameter is referenced in the template during stack creation or update.


## How do ALBListener & HTTPListener correlate to the ECS Service?

The ALBListener (HTTP) and HTTPSListener are attached to your Application Load Balancer (ALB). They listen for incoming traffic on ports 80 (HTTP) and 443 (HTTPS).
- The ALBListener (HTTP) redirects all HTTP traffic to HTTPS for security.
- The HTTPSListener forwards HTTPS traffic to the target group.
- The target group contains the ECS tasks managed by your ECS Service.

So, the listeners act as entry points for web traffic, and they route requests to the ECS Service's running containers via the target group. This connects the load balancer to your application running in ECS.


## Explain VPC and subnets

A VPC (Virtual Private Cloud) is your own isolated network within AWS. It lets you define your own IP address range, subnets, route tables, and gateways, giving you control over how resources communicate with each other and the internet.

Subnets are subdivisions within a VPC. Each subnet represents a range of IP addresses in your VPC and is mapped to a specific Availability Zone (AZ) in a region. You use subnets to group resources based on security or operational needs, such as separating public-facing resources (in public subnets) from private resources (in private subnets).

In summary: VPC = your private AWS network; subnets = segments within that network for organizing and isolating resources.


## Understand why ports are specified where they are

Ports are specified to control how traffic flows between components:
- The ALB listens on ports 80 (HTTP) and 443 (HTTPS) to accept web traffic from users.
- The target group and ECS tasks use port 80 because your application inside the container is set up to listen on port 80.
- Security groups allow traffic on these ports to ensure only the right connections are permitted (e.g., ALB allows 80/443 from the internet, ECS tasks allow 80 from the ALB).

This setup ensures:
- Users can access your app via standard web ports (80/443).
- The load balancer can forward requests to your containers on the correct port.
- Network security is maintained by only opening necessary ports at each layer.


## What are the ECS service responsibilities?

Yes, a service's main job is to ensure the desired number of tasks are always running—if a task fails or stops, the service will automatically start a new one. But a service also provides:
- Load balancing: It can register tasks with a load balancer (like your ALB) for traffic distribution.
- Rolling updates: It manages deployments, allowing you to update your app with zero downtime by gradually replacing old tasks with new ones.
- Health management: It can monitor task health and replace unhealthy tasks.
- Placement strategies: It controls how and where tasks are placed across your cluster resources.

So, a service is responsible for availability, scaling, deployment, and integration with load balancers.

