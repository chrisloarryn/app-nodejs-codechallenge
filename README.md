# Hello :wave: !!
In this repository you will find the code challenge for the NodeJS Developer position at Yape.

This works as follows:
- Transaction microservice creates a transaction and sends a transaction created event.
- Anti-fraud microservice receives a transaction created event, validates it and sends a transaction status updated event.
- Transaction microservice receives a transaction status updated event and updates the transaction status. (as a event handler)
- Transaction microservice exposes a REST API to create and retrieve transactions.
- Transaction also exposes a GraphQL API to create and retrieve transactions.

in the `docker-compose.yml` file you will find the services that you need to run the project.

To run the project you need to run the following command:

```bash
bash start.sh
```

This will run the following services:
- Kafka
- Zookeeper
- MongoDB
- Transaction microservice
- Anti-fraud microservice
- GraphQL API (transaction microservice)
- REST API (transaction microservice)

There is a postman collection in the `postman` folder that you can use to test the REST API and the GraphQL API.



### NOTE:
- Since you execute ```bash start.sh``` the first time, you will need to wait a few seconds for the services to start.

- #### start.sh file has some checks to wait for the services to be ready.

### NOTE 2:
- if endpoints are not working, try to restart the services with ```bash start.sh``` again.



---


# Yape Code Challenge :rocket:

Our code challenge will let you marvel us with your Jedi coding skills :smile:. 

Don't forget that the proper way to submit your work is to fork the repo and create a PR :wink: ... have fun !!

- [Yape Code Challenge :rocket:](#yape-code-challenge-rocket)
- [Problem](#problem)
- [Tech Stack](#tech-stack)
  - [Optional](#optional)
- [Send us your challenge](#send-us-your-challenge)

# Problem

Every time a financial transaction is created it must be validated by our anti-fraud microservice and then the same service sends a message back to update the transaction status.
For now, we have only three transaction statuses:

<ol>
  <li>pending</li>
  <li>approved</li>
  <li>rejected</li>  
</ol>

Every transaction with a value greater than 1000 should be rejected.

```mermaid
  flowchart LR
    Transaction -- Save Transaction with pending Status --> transactionDatabase[(Database)]
    Transaction --Send transaction Created event--> Anti-Fraud
    Anti-Fraud -- Send transaction Status Approved event--> Transaction
    Anti-Fraud -- Send transaction Status Rejected event--> Transaction
    Transaction -- Update transaction Status event--> transactionDatabase[(Database)]
```

# Tech Stack

<ol>
  <li>Node. You can use any framework you want (i.e. Nestjs with an ORM like TypeOrm or Prisma) </li>
  <li>Any database</li>
  <li>Kafka</li>    
</ol>

We do provide a `Dockerfile` to help you get started with a dev environment.

You must have two resources:

1. Resource to create a transaction that must containt:

```json
{
  "accountExternalIdDebit": "Guid",
  "accountExternalIdCredit": "Guid",
  "tranferTypeId": 1,
  "value": 120
}
```

2. Resource to retrieve a transaction

```json
{
  "transactionExternalId": "Guid",
  "transactionType": {
    "name": ""
  },
  "transactionStatus": {
    "name": ""
  },
  "value": 120,
  "createdAt": "Date"
}
```

## Optional

You can use any approach to store transaction data but you should consider that we may deal with high volume scenarios where we have a huge amount of writes and reads for the same data at the same time. How would you tackle this requirement?

You can use Graphql;

# Send us your challenge

When you finish your challenge, after forking a repository, you **must** open a pull request to our repository. There are no limitations to the implementation, you can follow the programming paradigm, modularization, and style that you feel is the most appropriate solution.

If you have any questions, please let us know.
