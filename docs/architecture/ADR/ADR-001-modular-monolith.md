# ADR-001: Modular Monolith

Status: **Proposed**

## Context
The MVP has tightly coupled commerce transactions and a small operational footprint.
## Problem
Choose a structure that protects boundaries without premature distributed systems.
## Options
Modular monolith; microservices; unstructured monolith.
## Decision
Use one deployable application with explicit domain modules and interfaces.
## Consequences
Simpler transactions and operations; discipline and tests must enforce boundaries.
## Risks
Modules can erode into coupling; one runtime is a shared failure domain.
## Alternatives
Microservices add network and consistency complexity; an unstructured monolith reduces maintainability.
## Revisit conditions
Independent scaling, deployment, ownership, or isolation needs supported by production evidence.
