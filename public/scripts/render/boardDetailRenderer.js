import { handleAddComment, handleEditComment, handleDeleteComment, handleDeleteBoard } from '../handler/boardDetailHandler.js';
import { changeNumberExpression } from '../../utils/utils.js';
import { BASE_URL } from '../../utils/const.js';
import API from '../../api/api.js';

export const renderBoardDetail = (boardDetail, userId, isLiked) => {
  const boardId = boardDetail.boardId;

  // 제목
  document.getElementById('board-detail-title').innerHTML = `
    <h1 class="ellipsis-26">${boardDetail.title}</h1>
  `;

  // 메타 정보
  document.getElementById('board-detail-info-container').innerHTML = `
    <div id="board-detail-info">
      <div id="avatar-div" class="avatar"></div>
      <p id="board-detail-info-writer">${boardDetail.writerNickname}</p>
      <p id="board-detail-info-time">${boardDetail.createdAt}</p>
    </div>
    
    <div class="board-btn-container">
      <button id="board-detail-edit-btn" style="visibility: hidden;">수정</button>
      <button id="board-detail-delete-btn" style="visibility: hidden;">삭제</button>
    </div>
  `;

  const boardDetailEditBtn = document.getElementById('board-detail-edit-btn');
  const boardDetailDeleteBtn = document.getElementById('board-detail-delete-btn');

  if (userId === boardDetail.writerId) {
    boardDetailEditBtn.style.visibility = 'visible';
    boardDetailDeleteBtn.style.visibility = 'visible';

    boardDetailEditBtn.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = `/boards/${boardId}/edit`;
    });

    boardDetailDeleteBtn.addEventListener('click', e => {
      e.preventDefault();
      const modalElement = document.getElementById('board-modal');
      modalElement.setAttribute('board-id', boardId.toString());
      modalElement.open();
    });
  }

  const avatarDiv = document.getElementById('avatar-div');
  const profileImgUrl = `${BASE_URL}/${boardDetail.writerProfileImg}`;
  avatarDiv.style.backgroundImage = `url(${profileImgUrl})`;
  avatarDiv.style.backgroundSize = 'cover';

  // 본문
  document.getElementById('board-detail-content-container').innerHTML = `
    <div id="board-detail-img-container">
      <img alt="" />
    </div>
    <div id="board-detail-content">
      <p>${boardDetail.content}</p>
    </div>
  `;

  const boardImg = document.querySelector('#board-detail-img-container > img');
  if (boardImg && boardDetail.boardImg) {
    boardImg.src = `${BASE_URL}/${boardDetail.boardImg}`;
  }

  // 좋아요, 조회수, 댓글수
  document.getElementById('board-cnt-container').innerHTML = `
    <div id="board-like-btn">
      <p id="board-like-cnt">${boardDetail.likeCnt}</p>
      <p>좋아요</p>
    </div>
    <div>
      <p>${boardDetail.viewCnt}</p>
      <p>조회수</p>
    </div>
    <div>
      <p id="board-comment-cnt">${boardDetail.commentCnt}</p>
      <p>댓글</p>
    </div>
  `;

  // 좋아요 초기 색상 지정 및 이벤트 추가
  const boardLikeBtnElement = document.getElementById('board-like-btn');
  const boardLikeCntElement = document.getElementById('board-like-cnt');
  let likeCnt = boardDetail.likeCnt;
  let currentLiked = isLiked;

  boardLikeBtnElement.style.backgroundColor = isLiked ? '#ACA0EB' : '#D9D9D9';
  boardLikeBtnElement.addEventListener('click', async e => {
    e.preventDefault();

    try {
      currentLiked = !currentLiked;
      likeCnt += currentLiked ? 1 : -1;

      // UI 즉시 업데이트
      boardLikeCntElement.innerHTML = changeNumberExpression(likeCnt);
      boardLikeBtnElement.style.backgroundColor = currentLiked ? '#ACA0EB' : '#D9D9D9';

      // 서버에 좋아요 토글 요청
      await API.toggleBoardLike(userId, boardId);
    } catch (err) {
      console.error(err.message);

      // 변경 전으로 되돌리기
      currentLiked = !currentLiked;
      likeCnt += currentLiked ? -1 : 1;
      boardLikeCntElement.innerHTML = changeNumberExpression(likeCnt);
      boardLikeBtnElement.style.backgroundColor = currentLiked ? '#ACA0EB' : '#D9D9D9';
    }
  });
};

/* 댓글 추가 버튼, textarea 렌더링 */
export const renderBoardCommentArea = (userId, boardId) => {
  // 댓글 등록 버튼 이벤트 추가
  const commentAreaElement = document.getElementById('board-comments-add-area');
  const commentAddBtnElement = document.getElementById('board-comments-add-btn');

  commentAreaElement.addEventListener('input', e => {
    const isEmpty = e.target.value === '';
    commentAddBtnElement.style.backgroundColor = isEmpty ? '#ACA0EB' : '#7F6AEE';
    commentAddBtnElement.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
    commentAddBtnElement.disabled = isEmpty;
  });

  commentAddBtnElement.addEventListener('click', e => {
    e.preventDefault();
    handleAddComment(userId, boardId);
  });
};

/* 단건 게시글 코멘트 렌더링 */
export const renderBoardComment = (boardComment, userId, boardId) => {
  const boardCommentContainerElement = document.getElementById('board-comments-container');

  // 댓글 컨테이너 생성
  const commentContainer = document.createElement('div');
  commentContainer.className = 'board-comments-info-container';
  commentContainer.setAttribute('id', boardComment.commentId); // 낙관적 업데이트를 위한 id 지정

  if (commentContainer.getAttribute('id').startsWith('temp-')) {
    commentContainer.style.backgroundColor = 'lightgray';
  }

  // 댓글 메타 정보 컨테이너
  const metaContainer = document.createElement('div');
  metaContainer.className = 'board-comments-meta-container';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'board-comments-info';

  // 아바타 설정
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.style.backgroundImage = `url(${BASE_URL}/${boardComment.writerProfileImg})`;
  avatar.style.backgroundSize = 'cover';
  avatar.style.backgroundRepeat = 'no-repeat';
  avatar.style.backgroundPosition = 'center';

  // 작성자 닉네임
  const writerNickname = document.createElement('p');
  writerNickname.className = 'board-comments-info-writer';
  writerNickname.textContent = boardComment.writerNickname;

  // 작성 시간
  const createdAt = document.createElement('p');
  createdAt.className = 'board-comments-info-time';
  createdAt.textContent = boardComment.createdAt;

  infoContainer.appendChild(avatar);
  infoContainer.appendChild(writerNickname);
  infoContainer.appendChild(createdAt);

  // 버튼 컨테이너
  const isMyComment = boardComment.writerId === userId;
  const btnContainer = document.createElement('div');
  const commentEditBtnElement = document.createElement('button');
  const commentDeleteBtnElement = document.createElement('button');

  btnContainer.className = 'board-comments-btn-container';
  commentEditBtnElement.textContent = '수정';
  commentEditBtnElement.style.visibility = isMyComment ? 'visible' : 'hidden';
  commentDeleteBtnElement.textContent = '삭제';
  commentDeleteBtnElement.style.visibility = isMyComment ? 'visible' : 'hidden';
  btnContainer.appendChild(commentEditBtnElement);
  btnContainer.appendChild(commentDeleteBtnElement);

  // 버튼에 이벤트 추가
  if (isMyComment) {
    const commentId = parseInt(commentContainer.getAttribute('id'), 10) || null;

    commentEditBtnElement.addEventListener('click', e => {
      e.preventDefault();
      handleEditComment(e.target.parentNode, commentId, boardId, userId);
    });

    commentDeleteBtnElement.addEventListener('click', e => {
      e.preventDefault();
      const modalElement = document.getElementById('comment-modal');
      modalElement.setAttribute('comment-id', commentId.toString());
      modalElement.open();
    });
  }

  metaContainer.appendChild(infoContainer);
  metaContainer.appendChild(btnContainer);

  // 댓글 내용 컨테이너
  const commentContentContainer = document.createElement('div');
  commentContentContainer.className = 'board-comments-comment-container';

  const commentContent = document.createElement('p');
  commentContent.textContent = boardComment.content;

  commentContentContainer.appendChild(commentContent);

  // 모든 요소 조합
  commentContainer.appendChild(metaContainer);
  commentContainer.appendChild(commentContentContainer);

  // 댓글 컨테이너 추가
  boardCommentContainerElement.appendChild(commentContainer);
};

/* 게시글 코멘트 목록 렌더링 */
export const renderBoardComments = (boardComments, userId, boardId) => {
  boardComments.forEach(boardComment => renderBoardComment(boardComment, userId, boardId));
};

/* 댓글 모달창 렌더링 */
export const renderCommentModal = (userId, boardId) => {
  const commentModalElement = document.getElementById('comment-modal');
  commentModalElement.innerHTML = `
    <div id="comment-modal-container" class="modal-container">
      <div id="comment-modal-title" class="modal-title-container">
        <h3>댓글을 삭제하시겠습니까?</h3>
        <p>삭제한 내용은 복구할 수 없습니다.</p>
      </div>
      <div class="modal-btn-container">
        <button class="modal-btn-cancel">취소</button>
        <button class="modal-btn-ok">확인</button>
      </div>
    </div>
  `;

  commentModalElement.querySelector('.modal-btn-cancel').addEventListener('click', () => commentModalElement.close());
  commentModalElement.querySelector('.modal-btn-ok').addEventListener('click', e => {
    e.preventDefault();
    const commentId = commentModalElement.getAttribute('comment-id');
    handleDeleteComment(commentId, userId, boardId);
  });
};

/* 게시글 모달창 렌더링 */
export const renderBoardModal = userId => {
  const boardModalElement = document.getElementById('board-modal');
  boardModalElement.innerHTML = `
    <div id="board-modal-container" class="modal-container">
      <div id="board-modal-title" class="modal-title-container">
        <h3>게시글을 삭제하시겠습니까?</h3>
        <p>삭제한 내용은 복구할 수 없습니다.</p>
      </div>
      <div class="modal-btn-container">
        <button class="modal-btn-cancel">취소</button>
        <button class="modal-btn-ok">확인</button>
      </div>
    </div>
  `;

  boardModalElement.querySelector('.modal-btn-cancel').addEventListener('click', () => boardModalElement.close());
  boardModalElement.querySelector('.modal-btn-ok').addEventListener('click', e => {
    e.preventDefault();
    const boardId = parseInt(boardModalElement.getAttribute('board-id'), 10) || null;
    handleDeleteBoard(userId, boardId);
  });
};
