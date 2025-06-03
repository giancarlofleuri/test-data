import pandas as pd
import numpy as np
from collections import defaultdict
import os
import csv

def analyze_participant_data(participant_type='business'):
    """
    Analyze card sorting data for either business or personal participants
    participant_type: 'business' or 'personal'
    """
    # Initialize data structures
    cards = set()
    cooccurrences = defaultdict(lambda: defaultdict(int))
    
    # Define which images to analyze based on participant type
    if participant_type == 'business':
        image_range = range(6, 11)  # Images 6-10 (right side)
    else:
        image_range = range(1, 6)   # Images 1-5 (left side)
        
    # Process each participant's data
    for img_num in image_range:
        filename = f"participants/Website Refresh 2025 ({img_num}).png"
        if os.path.exists(filename):
            # Here you would process the image data
            # For now, we'll use placeholder data
            participant_cards = get_cards_from_image(filename)
            
            # Update cards set
            cards.update(participant_cards)
            
            # Update co-occurrences
            for i, card1 in enumerate(participant_cards):
                for card2 in participant_cards[i+1:]:
                    cooccurrences[card1][card2] += 1
                    cooccurrences[card2][card1] += 1

    return cards, cooccurrences

def get_cards_from_image(filename):
    """
    Placeholder function - in real implementation, this would use OCR
    to extract card names from the images
    """
    # For now, return sample data based on the image number
    # This should be replaced with actual image processing logic
    business_cards = [
        "Business account",
        "Business loans",
        "Business support",
        "Company information",
        "Contact us",
        "FAQs",
        "Help center"
    ]
    
    personal_cards = [
        "Personal account",
        "Savings",
        "Investments",
        "Support",
        "About us",
        "Help & support",
        "Contact"
    ]
    
    if "6" in filename or "7" in filename or "8" in filename or "9" in filename or "10" in filename:
        return business_cards
    else:
        return personal_cards

def create_cooccurrence_matrix(cards, cooccurrences):
    """Create a co-occurrence matrix from the collected data"""
    cards_list = sorted(list(cards))
    matrix = []
    
    for card1 in cards_list:
        row = []
        for card2 in cards_list:
            if card1 == card2:
                row.append(0)
            else:
                row.append(cooccurrences[card1][card2])
        matrix.append(row)
    
    return pd.DataFrame(matrix, index=cards_list, columns=cards_list)

def save_matrix(matrix, filename):
    """Save the co-occurrence matrix to a CSV file"""
    matrix.to_csv(filename)

def main():
    # Analyze business participants
    business_cards, business_cooccurrences = analyze_participant_data('business')
    business_matrix = create_cooccurrence_matrix(business_cards, business_cooccurrences)
    save_matrix(business_matrix, 'card_cooccurrence_matrix_v4_business.csv')
    
    # Analyze personal participants
    personal_cards, personal_cooccurrences = analyze_participant_data('personal')
    personal_matrix = create_cooccurrence_matrix(personal_cards, personal_cooccurrences)
    save_matrix(personal_matrix, 'card_cooccurrence_matrix_v4_personal.csv')
    
    print("Analysis complete. Matrices saved to CSV files.")

if __name__ == "__main__":
    main() 