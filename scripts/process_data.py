import json
import pandas as pd
from datetime import datetime

def clean_worldbank_data(raw_data):
    """
    Clean and transform raw World Bank API data into a more usable format.
    
    Args:
        raw_data (list): The raw data from World Bank API (second element of the response)
        
    Returns:
        dict: Cleaned and processed data in a structured format
    """
    if not raw_data:
        return None
    
    # Create DataFrame from raw data
    df = pd.DataFrame(raw_data)
    
    # Extract relevant columns
    df = df[['date', 'value', 'country', 'indicator']].copy()
    
    # Convert date to integer year
    df['date'] = df['date'].astype(int)
    
    # Clean value column - convert to float and handle nulls
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    
    # Extract country ISO code and name
    df['country_code'] = df['country'].apply(lambda x: x['id'])
    df['country_name'] = df['country'].apply(lambda x: x['value'])
    
    # Extract indicator ID and name
    df['indicator_code'] = df['indicator'].apply(lambda x: x['id'])
    df['indicator_name'] = df['indicator'].apply(lambda x: x['value'])
    
    # Drop original complex columns
    df.drop(columns=['country', 'indicator'], inplace=True)
    
    # Sort by year
    df.sort_values('date', inplace=True)
    
    # Convert to dictionary for easier JSON serialization
    processed_data = {
        'metadata': {
            'source': 'World Bank API',
            'retrieved_on': datetime.now().isoformat(),
            'country_codes': df['country_code'].unique().tolist(),
            'indicators': df['indicator_code'].unique().tolist(),
            'year_range': {
                'min': int(df['date'].min()),
                'max': int(df['date'].max())
            }
        },
        'data': df.to_dict('records')
    }
    
    return processed_data

def save_processed_data(data, filename):
    """
    Save processed data to a JSON file.
    
    Args:
        data (dict): Processed data to save
        filename (str): Path to the output file
    """
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Processed data saved to {filename}")

def load_processed_data(filename):
    """
    Load processed data from a JSON file.
    
    Args:
        filename (str): Path to the input file
        
    Returns:
        dict: The loaded processed data
    """
    with open(filename, 'r') as f:
        return json.load(f)

def aggregate_by_year(data, country_code, indicator_code):
    """
    Aggregate data by year for a specific country and indicator.
    
    Args:
        data (list): The processed data records
        country_code (str): ISO country code (e.g., 'ETH')
        indicator_code (str): World Bank indicator code
        
    Returns:
        dict: {year: value} mapping
    """
    filtered = [
        item for item in data 
        if item['country_code'] == country_code 
        and item['indicator_code'] == indicator_code
    ]
    return {item['date']: item['value'] for item in filtered}

if __name__ == "__main__":
    # Example usage
    input_file = "../data/raw/ethiopia_gdp_raw.json"
    output_file = "../data/processed/ethiopia_gdp_processed.json"
    
    # Load raw data
    with open(input_file, 'r') as f:
        raw_data = json.load(f)
    
    # Process the data
    processed_data = clean_worldbank_data(raw_data)
    
    if processed_data:
        # Save processed data
        save_processed_data(processed_data, output_file)
        
        # Example of using the aggregated data
        eth_gdp = aggregate_by_year(
            processed_data['data'], 
            country_code='ETH', 
            indicator_code='NY.GDP.MKTP.CD'
        )
        print(f"Ethiopia GDP data by year: {eth_gdp}")
