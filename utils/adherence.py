def calculate_adherence(dose_logs):
    """
    Calculate adherence percentage based on dose logs.
    
    Args:
        dose_logs: List of dose log records with status field
        
    Returns:
        float: Adherence percentage (0-100)
    """
    if not dose_logs:
        return 0.0
    
    total_doses = len(dose_logs)
    taken_doses = sum(1 for log in dose_logs if log.get('status') == 'Taken')
    
    return (taken_doses / total_doses) * 100 if total_doses > 0 else 0.0

def count_missed_doses(dose_logs):
    """
    Count the number of missed doses.
    
    Args:
        dose_logs: List of dose log records with status field
        
    Returns:
        int: Number of missed doses
    """
    return sum(1 for log in dose_logs if log.get('status') == 'Missed')