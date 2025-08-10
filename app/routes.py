from flask import Blueprint, request, jsonify
from sqlalchemy.orm import sessionmaker
from app.database import database_connector, Articles


article = Blueprint("article", __name__)


Session = sessionmaker(bind=database_connector)


@article.route("/create/article", methods=["POST"])
def create_article():

    """
    Create a new article.
    Expects JSON payload with keys: title, author, category.
    """ 

    session = Session()
    post_request = request.get_json()

    try:
        new_articles = Articles(
            title = post_request["title"],
            author = post_request["author"],
            category = post_request["category"]
        )

        session.add(new_articles)
        session.commit()

    except KeyError:
         return jsonify({"Error": "Missing required fields"}), 400
    
    finally:
        session.close()

    return jsonify({"Success!": "Article has been created..."}), 201


@article.route("/update/article/<id>", methods=["PUT"])
def update_article(id):

    """
    Update an existing article by ID.
    Expects JSON payload with keys: title, author, category.
    """

    session = Session()

    put_request = request.get_json()

    try:
        article_id = int(id)
        articles = session.get(Articles,article_id)

        if not articles:
            session.close()
            return jsonify({"Alert":"Article not found"}), 404

        articles.title = put_request["title"]
        articles.author = put_request["author"]
        articles.category = put_request["category"]

        session.commit()

    except KeyError:
        return jsonify({"Error": "Missing required fields"}), 400
    
    finally:
        session.close()

    return jsonify({"Success!":"Article has been updated..."}), 200


@article.route("/get/article", methods=["GET"])
def get_articles():

    """
    Retrieve all articles.
    """

    session = Session()
    articles = session.query(Articles).all()

    if not articles:
        session.close()
        return jsonify({"Alert":"The article database is empty"}), 200

    articles_found = []

    for article in articles:
        articles_found.append({
            "title": article.title,
            "author": article.author,
            "category": article.category
        })

    session.close()

    return jsonify(articles_found), 200


@article.route("/get/article/<id>", methods=["GET"])
def get_certain_article(id):

    """
    Retrieve a specific article by ID.
    """

    session = Session()

    try:
        article_id = int(id)
        article = session.get(Articles,article_id)

        if not article:
                return jsonify({"error": "Article not found"}), 404
        
        return jsonify({
            "title": article.title,
            "author": article.author,
            "category": article.category
        }), 200
    
    finally:
         session.close()


@article.route("/delete/article/<id>", methods=["DELETE"])
def delete_article(id):
    
    """
    Delete an article by ID.
    """
   
    session = Session()

    try:
        selected_article = int(id)
        article = session.get(Articles,selected_article)

        if not article:
                    return jsonify({"error": "Article not found"}), 404
        
        session.delete(article)
        session.commit()
        

        return jsonify({
            "Alert": f"{article.title} by {article.author} has been deleted..."
        }), 200
    finally:
         session.close()