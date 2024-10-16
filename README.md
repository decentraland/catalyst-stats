# catalyst-stats-aggregator

[![Coverage Status](https://coveralls.io/repos/github/decentraland/catalyst-stats/badge.svg?branch=coverage)](https://coveralls.io/github/decentraland/catalyst-stats?branch=coverage)

Catalyst Stats Aggregator is a service designed to collect and aggregate metrics from all nodes within the network. It offers several communication endpoints to access various types of data, including:

    `/peers`: Retrieve information about connected peers
    `/parcels`: Access data related to parcels with peers
    `/islands`: Get all the the islands with the peers in each island
    `/islands/:id`: Fetch details for a specific island by its ID
    `/hot-scenes`: Discover currently popular scenes
    `/realms`: View the list of available realms

