import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manages friendships - send requests, accept, get friends list
    Args: event with httpMethod, headers with X-User-Id, body with friend operations
    Returns: HTTP response with friendship data
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
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User ID required in X-User-Id header'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            friend_id = body_data.get('friend_id')
            
            if action == 'send_request':
                cur.execute(
                    "INSERT INTO friendships (user_id, friend_id, status) VALUES (%s, %s, 'pending') ON CONFLICT DO NOTHING RETURNING id",
                    (user_id, friend_id)
                )
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'message': 'Friend request sent'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'accept_request':
                cur.execute(
                    "UPDATE friendships SET status = 'accepted' WHERE user_id = %s AND friend_id = %s",
                    (friend_id, user_id)
                )
                cur.execute(
                    "INSERT INTO friendships (user_id, friend_id, status) VALUES (%s, %s, 'accepted') ON CONFLICT DO NOTHING",
                    (user_id, friend_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'message': 'Friend request accepted'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            cur.execute("""
                SELECT u.id, u.nickname, u.username, f.status
                FROM friendships f
                JOIN users u ON (f.friend_id = u.id)
                WHERE f.user_id = %s AND f.status = 'accepted'
                UNION
                SELECT u.id, u.nickname, u.username, f.status
                FROM friendships f
                JOIN users u ON (f.user_id = u.id)
                WHERE f.friend_id = %s AND f.status = 'accepted'
            """, (user_id, user_id))
            
            friends = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps([
                    {'id': f[0], 'nickname': f[1], 'username': f[2], 'status': f[3]}
                    for f in friends
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
