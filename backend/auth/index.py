import json
import os
import random
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handles phone authentication - sends SMS codes and verifies them
    Args: event with httpMethod, body containing phone/code
    Returns: HTTP response with success/error status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if action == 'send_code':
            phone = body_data.get('phone')
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Phone is required'}),
                    'isBase64Encoded': False
                }
            
            code = str(random.randint(100000, 999999))
            expires_at = datetime.now() + timedelta(minutes=5)
            
            cur.execute(
                "INSERT INTO sms_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
                (phone, code, expires_at)
            )
            conn.commit()
            
            print(f"SMS Code for {phone}: {code}")
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Code sent successfully',
                    'dev_code': code
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'verify_code':
            phone = body_data.get('phone')
            code = body_data.get('code')
            
            if not phone or not code:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Phone and code are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "SELECT id FROM sms_codes WHERE phone = %s AND code = %s AND verified = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                (phone, code)
            )
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Invalid or expired code'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("UPDATE sms_codes SET verified = TRUE WHERE id = %s", (result[0],))
            
            cur.execute("SELECT id, nickname, username FROM users WHERE phone = %s", (phone,))
            user = cur.fetchone()
            
            conn.commit()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'user_exists': True,
                        'user': {
                            'id': user[0],
                            'nickname': user[1],
                            'username': user[2]
                        }
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'user_exists': False
                    }),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
