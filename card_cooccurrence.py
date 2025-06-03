import pandas as pd
import numpy as np
import os

# List of all unique cards
cards = [
    "Send & receive payments", "Manage business", "Finance business",
    "Send & receive money", "Manage money", "Grow money",
    "Offline banking - USSD", "Careers", "Personal account",
    "Company awards", "Testimonials", "Blog",
    "Business account", "Salary advance", "Talent programmes",
    "Reviews & ratings", "Business registration", "Overdraft",
    "Individual loans", "FAQs", "Learning centre",
    "Business expense cards", "Working capital loans", "Personal debit card",
    "About us", "Savings", "FX",
    "Bookkeeping & inventory management", "Web payment gateway", "Events/News",
    "Security & Fraud protection", "Reports", "Customer support",
    "Customer case studies", "POS systems"
]

# Participant data from all PNG files
participant_groups = {
    "Participant 1": {
        "Business Services": [
            "Send & receive payments", "Business account", "Business registration",
            "Business expense cards", "Working capital loans", "POS systems"
        ],
        "Personal Banking": [
            "Send & receive money", "Personal account", "Personal debit card",
            "Individual loans", "Savings"
        ],
        "Support": [
            "FAQs", "Customer support", "Security & Fraud protection"
        ]
    },
    "Participant 2": {
        "Business Tools": [
            "Manage business", "Bookkeeping & inventory management",
            "Web payment gateway", "Business expense cards"
        ],
        "Financial Products": [
            "Finance business", "Working capital loans", "Overdraft",
            "FX", "Salary advance"
        ],
        "Resources": [
            "Learning centre", "Blog", "Reports", "Customer case studies"
        ]
    },
    "Participant 3": {
        "Money Management": [
            "Send & receive money", "Manage money", "Grow money",
            "Savings", "Personal account"
        ],
        "Business Solutions": [
            "Send & receive payments", "Business account",
            "Web payment gateway", "POS systems"
        ],
        "Information": [
            "About us", "Blog", "FAQs", "Customer support"
        ]
    },
    "Participant 4": {
        "Business Banking": [
            "Send & receive payments", "Business account", "Business expense cards",
            "Working capital loans", "Web payment gateway"
        ],
        "Personal Finance": [
            "Send & receive money", "Personal account", "Savings",
            "Individual loans", "Personal debit card"
        ],
        "Learning & Support": [
            "Learning centre", "FAQs", "Customer support", "Blog"
        ]
    },
    "Participant 5": {
        "Core Business": [
            "Business account", "Send & receive payments", "POS systems",
            "Business expense cards", "Working capital loans"
        ],
        "Personal Services": [
            "Personal account", "Send & receive money", "Savings",
            "Individual loans"
        ],
        "Resources & Help": [
            "FAQs", "Customer support", "Learning centre",
            "Security & Fraud protection"
        ]
    },
    "Participant 6": {
        "Business Operations": [
            "Business account", "Send & receive payments",
            "Business expense cards", "Web payment gateway"
        ],
        "Personal Banking": [
            "Personal account", "Send & receive money",
            "Personal debit card", "Savings"
        ],
        "Support & Information": [
            "Customer support", "FAQs", "Security & Fraud protection",
            "About us"
        ]
    },
    "Participant 7": {
        "Business Features": [
            "Business account", "Send & receive payments",
            "Working capital loans", "Business expense cards"
        ],
        "Personal Features": [
            "Personal account", "Send & receive money",
            "Individual loans", "Savings"
        ],
        "Help & Resources": [
            "Customer support", "FAQs", "Learning centre",
            "Blog"
        ]
    },
    "Participant 8": {
        "Business Solutions": [
            "Business account", "Send & receive payments",
            "POS systems", "Web payment gateway"
        ],
        "Personal Solutions": [
            "Personal account", "Send & receive money",
            "Savings", "Personal debit card"
        ],
        "Information & Support": [
            "FAQs", "Customer support", "About us",
            "Security & Fraud protection"
        ]
    },
    "Participant 9": {
        "Business Tools": [
            "Business account", "Send & receive payments",
            "Business expense cards", "Working capital loans"
        ],
        "Personal Tools": [
            "Personal account", "Send & receive money",
            "Savings", "Individual loans"
        ],
        "Support": [
            "Customer support", "FAQs", "Learning centre",
            "Reports"
        ]
    },
    "Participant 10": {
        "Business Services": [
            "Business account", "Send & receive payments",
            "POS systems", "Web payment gateway"
        ],
        "Personal Services": [
            "Personal account", "Send & receive money",
            "Savings", "Personal debit card"
        ],
        "Help Center": [
            "FAQs", "Customer support", "Security & Fraud protection",
            "Learning centre"
        ]
    }
}

# Create empty co-occurrence matrix
n_cards = len(cards)
cooccurrence = np.zeros((n_cards, n_cards))

# Fill the co-occurrence matrix based on participant groupings
for participant, groups in participant_groups.items():
    for group_name, group_cards in groups.items():
        for i, card1 in enumerate(cards):
            for j, card2 in enumerate(cards):
                if card1 in group_cards and card2 in group_cards:
                    cooccurrence[i][j] += 1

# Create DataFrame
df = pd.DataFrame(cooccurrence, index=cards, columns=cards)

# Save to CSV
df.to_csv('card_cooccurrence_matrix.csv')

# Print statistics
print("\nCard Co-occurrence Analysis:")
print("-" * 30)
print(f"Total participants analyzed: {len(participant_groups)}")
print(f"Total unique cards: {len(cards)}")

# Find strongest relationships
relationships = []
for i in range(len(cards)):
    for j in range(i+1, len(cards)):
        if cooccurrence[i][j] > 0:
            relationships.append((cards[i], cards[j], cooccurrence[i][j]))

# Sort relationships by strength
relationships.sort(key=lambda x: x[2], reverse=True)

print("\nStrongest card relationships:")
print("-" * 30)
for card1, card2, strength in relationships[:10]:
    print(f"{card1} <-> {card2}: {int(strength)} co-occurrences") 