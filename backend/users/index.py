import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manages user operations - registration, profile updates, search
    Args: event with httpMethod, body containing user data
    Returns: HTTP response with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
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
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            phone = body_data.get('phone')
            nickname = body_data.get('nickname')
            username = body_data.get('username')
            
            if not phone or not nickname or not username:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Phone, nickname and username are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT id FROM users WHERE nickname = %s OR username = %s", (nickname, username))
            existing = cur.fetchone()
            
            if existing:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Nickname or username already taken'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO users (phone, nickname, username) VALUES (%s, %s, %s) RETURNING id, nickname, username, created_at",
                (phone, nickname, username)
            )
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'id': user[0],
                    'nickname': user[1],
                    'username': user[2],
                    'created_at': user[3].isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            search = query_params.get('search', '')
            
            if search:
                cur.execute(
                    "SELECT id, nickname, username FROM users WHERE username ILIKE %s OR nickname ILIKE %s LIMIT 20",
                    (f'%{search}%', f'%{search}%')
                )
            else:
                cur.execute("SELECT id, nickname, username FROM users LIMIT 20")
            
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps([
                    {'id': u[0], 'nickname': u[1], 'username': u[2]}
                    for u in users
                ]),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
