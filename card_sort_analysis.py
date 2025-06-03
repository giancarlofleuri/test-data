import pandas as pd
import json
from itertools import combinations
from collections import Counter
import seaborn as sns
import matplotlib.pyplot as plt
from datetime import datetime

def create_cooccurrence_matrix(data):
    # Extract all unique cards
    all_cards = set()
    card_appearances = Counter()
    
    # Count co-occurrences
    cooccurrences = Counter()
    
    # Process each participant's groups
    for participant in data:
        for group in participant['groups']:
            # Add cards to the set of all cards
            all_cards.update(group)
            
            # Count individual card appearances
            for card in group:
                card_appearances[card] += 1
            
            # Count co-occurrences for each pair in the group
            for card1, card2 in combinations(sorted(group), 2):
                cooccurrences[(card1, card2)] += 1
                cooccurrences[(card2, card1)] += 1
    
    # Create a DataFrame with zeros
    cards_list = sorted(all_cards)
    df = pd.DataFrame(0, index=cards_list, columns=cards_list)
    
    # Fill in co-occurrences
    for (card1, card2), count in cooccurrences.items():
        df.at[card1, card2] = count
    
    # Fill diagonal with total appearances
    for card in cards_list:
        df.at[card, card] = card_appearances[card]
    
    return df

def generate_report(matrix, output_prefix="card_sort"):
    # Create a heatmap visualization
    plt.figure(figsize=(12, 8))
    sns.heatmap(matrix, annot=True, cmap='YlOrRd', fmt='g')
    plt.title('Card Sorting Co-occurrence Matrix')
    
    # Rotate x-axis labels for better readability
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    
    # Adjust layout to prevent label cutoff
    plt.tight_layout()
    
    # Save as PDF
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"{output_prefix}_analysis_{timestamp}.pdf"
    plt.savefig(pdf_filename)
    plt.close()
    
    return pdf_filename

def main():
    # Example data structure for 8 participants
    example_data = [
        {
            "participant": "User 1",
            "groups": [
                ["Blog", "Testimonials", "Case Studies"],
                ["Pricing", "FAQ"]
            ]
        },
        {
            "participant": "User 2",
            "groups": [
                ["Blog", "Case Studies"],
                ["Testimonials", "FAQ"]
            ]
        }
        # Note: Replace with actual 8 participant data
    ]
    
    # Create the co-occurrence matrix
    matrix = create_cooccurrence_matrix(example_data)
    
    # Save to CSV
    csv_filename = 'cooccurrence_matrix.csv'
    matrix.to_csv(csv_filename)
    print(f"Co-occurrence matrix has been saved to '{csv_filename}'")
    
    # Generate and save PDF report
    pdf_filename = generate_report(matrix, "website_refresh_2025")
    print(f"PDF report has been saved as '{pdf_filename}'")
    
    print("\nMatrix Preview:")
    print(matrix)

if __name__ == "__main__":
    main() 