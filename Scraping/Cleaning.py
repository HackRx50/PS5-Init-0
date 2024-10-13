import pandas as pd
import re

def process_and_clean_data(main_df, csv_file1, csv_file2):
    df1 = pd.read_csv(csv_file1)
    df2 = pd.read_csv(csv_file2)

    df1.rename(columns={'CNR': 'cnr_number'}, inplace=True)

    merged_df = pd.merge(df1, df2, on='cnr_number', how='inner')

    merged_df_final = pd.concat([main_df, merged_df], ignore_index=True)

    merged_df_final[['Petitioner', 'Advocate_Petitioner']] = merged_df_final['petitioner_and_advocate'].str.split('Advocate-', n=1, expand=True)

    merged_df_final[['Advocate_Respondent', 'Respondent']] = merged_df_final['advocate_and_respondent'].str.split('2\\)', expand=True)
    merged_df_final['Advocate_Respondent'] = merged_df_final['Advocate_Respondent'].str.strip()
    merged_df_final['Respondent'] = merged_df_final['Respondent'].str.strip()

    merged_df_final[['Contested/Uncontested', 'Nature_of_Disposal']] = merged_df_final['nature_of_disposal'].str.split('--', expand=True)
    merged_df_final['Contested/Uncontested'] = merged_df_final['Contested/Uncontested'].str.strip()
    merged_df_final['Nature_of_Disposal'] = merged_df_final['Nature_of_Disposal'].str.strip()

    for col in ['first_hearing_date', 'decision_date']:
        merged_df_final[col] = merged_df_final[col].apply(lambda x: re.sub(r'(\d+)(st|nd|rd|th)', r'\1', x) if isinstance(x, str) else x)
        merged_df_final[col] = pd.to_datetime(merged_df_final[col], errors='coerce')
        merged_df_final[col] = merged_df_final[col].dt.strftime('%d-%m-%Y')

    merged_df_final['Advocate_Petitioner'] = merged_df_final['Advocate_Petitioner'].fillna('Unknown')

    merged_df_final.to_csv('final_cleaned_data.csv', index=False)
    print("Data processing and cleaning complete. The final file is saved as 'final_cleaned_data.csv'.")