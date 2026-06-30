# Fixed Bill Row Example

A fixed bill row should look conceptually like:

```txt
Name: Rent
Category: Housing
Monthly amount: 3098
Starts: 2026-07-01
Ends after: [blank]
Active: yes
```

If a subscription is canceled:

```txt
Name: ChatGPT
Category: Subscription
Monthly amount: 20
Starts: 2026-07-01
Ends after: 2026-08-01
Active: yes
```

That means weeks after the end date should stop counting the bill.
