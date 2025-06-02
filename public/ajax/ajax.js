
const notyf = new Notyf();

if (typeof $ === 'undefined') {
    notyf.error(`Jquery is not loaded properly, not compatible in vercel.`);
};

/**
 * Set toaster data item on local storage for access after reload
 */
function setToaster(storageName, dataMsg) {
    localStorage.setItem(storageName, 'true');
    localStorage.setItem('dataMsg', dataMsg);
};

/**
 * Initialize the toaster when it finished reload then clear the data from local storage.
 */
function initializedToaster(storageName, toastType = 'success', message = null) {
    switch (toastType) {
        case 'success':
            if (localStorage.getItem(storageName) === 'true') {
                const dataMsg = localStorage.getItem('dataMsg');

                notyf.success(dataMsg);

                localStorage.removeItem(storageName);
                localStorage.removeItem('dataName');
            };
            break;
        case 'error':
            notyf.error(message);
            localStorage.removeItem(storageName);
            break
        default:
            console.error('Invalid toast type');
            break;
    }
};

/**
 * Show multipurpose modal based on actions and collect data on it
 */
$(document).ready(function () {
    $('#actionModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const action = button.data('action');
        const title = button.data('title');
        const content = button.data('content') || '';
        const id = button.data('id') || '';
        const userId = button.data('user-id');
        const image = button.data('image');


        const preview = $('#imagePreview');

        if (action === 'create-post') {
            preview.addClass('d-none');
            preview.attr('src', '');
        };

        if (action === 'edit-post') {
            if (image) {
                preview.removeClass('d-none');
                preview.attr('src', image);
            } else {
                preview.addClass('d-none');
                preview.attr('src', '');
            }
        };

        $('#modalTitle').text(title);
        $('#modalContent').val(content);
        $('#modalAction').val(action);
        $('#modalItemId').val(id);
        $('#modalItemUserId').val(userId);

        validateModalInput();
    });

    $('#actionModal').on('input', '#modalContent', function () {
        validateModalInput();
    });

    function validateModalInput() {
        const inputVal = $('#modalContent').val()?.trim();

        if (!inputVal) {
            $('#modalSubmitButton').attr('disabled', true);
        } else {
            $('#modalSubmitButton').attr('disabled', false);
        }
    }
});

/**
 * Image loader
 */
$('#postImage').on('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').attr('src', e.target.result);
            $('#imagePreview').removeClass('d-none');
        };
        reader.readAsDataURL(file);
    }
});

/**
 * Loading state
 */
$.fn.setLoading = function (isLoading) {
    return this.each(function () {
        const $btn = $(this);

        if (isLoading) {
            if (!$btn.data('original-content')) {
                $btn.data('original-content', $btn.html());
            }

            $btn.html(`
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="visually-hidden">Loading...</span>
            `).prop('disabled', true);

        } else {
            const original = $btn.data('original-content');
            if (original) {
                $btn.html(original).prop('disabled', false);
                $btn.removeData('original-content'); // clear stored content
            }
        }
    });
};

/**
 * Ajax handler
 */
function handleAjax({
    url,
    method = 'POST',
    data = {},
    contentType = 'application/json',
    processData = true,
    xhrFields = {},
    button = null,
    modal = null,
    onSuccess = () => { },
    onError = () => { },
    reloadOnSuccess = true
}) {

    if (contentType === 'application/json' && typeof data === 'object') {
        data = JSON.stringify(data);
    };

    if (button) $(button).setLoading(true);

    $.ajax({
        url,
        method,
        contentType,
        xhrFields,
        data,
        processData,
        success: function (response) {
            if (modal) modal.hide();
            if (reloadOnSuccess) location.reload();
            onSuccess(response);
        },
        error: function (error) {
            console.error(`Error during AJAX request to ${url}:`, error);
            onError(error);
        },
        complete: function () {
            if (button) $(button).setLoading(false);
        }
    });
};

/**
 * Multi-purpose modal dynamic form submission
 */
$('#modalSubmitButton').on('click', function () {
    const button = $(this);

    const action = $('#modalAction').val();
    const content = $('#modalContent').val();
    const postImage = $('#postImage')[0]?.files[0];
    const id = $('#modalItemId').val();
    const userId = $('#modalItemUserId').val();
    const modal = mdb.Modal.getInstance(document.getElementById('actionModal'));

    const actions = {
        'create-post': () => {

            const formData = new FormData();
            formData.append('description', content);
            if (postImage) formData.append('postImage', postImage);

            handleAjax({
                url: '/posts/create',
                data: formData,
                contentType: false,
                processData: false,
                onSuccess: (response) => {
                    setToaster('createPost', response.message);
                },
                onError: (error) => {
                    notyf.error(error.message);
                },
                button,
                modal,
            });

        },
        'edit-post': () => {

            const formData = new FormData();
            formData.append('description', content);
            if (postImage) formData.append('postImage', postImage);

            handleAjax({
                url: `/posts/${id}/edit`,
                method: 'PUT',
                data: formData,
                processData: false,
                contentType: false,
                button,
                modal,
                onSuccess: () => {
                    setToaster('createPost', 'Post updated succesfully!');
                }
            });

        },
        'create-comment': () => {

            handleAjax({
                url: `/comments/${id}/new`,
                data: { content, userId },
                button,
                modal,
                onSuccess: (response) => {
                    setToaster('createComment', response.message);
                },
                onError: (error) => {
                    notyf.error(error.message);
                }
            });

        },
        'edit-comment': () => {

            handleAjax({
                url: `/comments/${id}/edit`,
                method: 'PUT',
                data: { content },
                button: button,
                modal: modal,
            });

        }
    };

    if (actions[action]) {
        actions[action]();
    } else {
        console.error('Invalid modal action:', action);
    };

});

initializedToaster('createPost', 'success');
initializedToaster('editPost', 'success');
initializedToaster('createComment', 'success');

/**
 * Delete handler
 */
$('.deleteButton').on('click', function (event) {
    const button = $(this);
    const id = button.data('id');
    const action = button.data('action');

    const username = button.data('usn');

    const actions = {
        'delete-post': () => {
            handleAjax({
                url: `/posts/${id}/delete`,
                method: 'DELETE',
                data: { id },
                button,
                onSuccess: (response) => {
                    setToaster('deletePost', response.message);
                },
                onError: (error) => {
                    notyf.error(error.message);
                }
            });
        },
        'delete-comment': () => {
            handleAjax({
                url: `/comments/${id}/delete`,
                method: 'DELETE',
                data: { id },
                button,
                onSuccess: (response) => {
                    setToaster('deleteComment', response.message);
                },
                onError: (error) => {
                    notyf.error(error.message);
                }
            });
        },
        'delete-profile': () => {
            let confirmation = prompt('Are you sure you want to delete your profile? YES / NO');

            if (confirmation === null) return;

            confirmation = confirmation.trim().toLowerCase();

            if (confirmation === 'yes') {
                handleAjax({
                    url: `/${username}/delete`,
                    method: 'DELETE',
                    data: { id },
                    button,
                    onSuccess: () => {
                        setToaster('deleteProfile', 'Profile deleted!');
                    }
                });
            } else if (confirmation === 'no') {
                alert("Okieee dokieee!");
                return;
            } else {
                alert('Invalid response.');
            }

        }
    }

    if (actions[action]) {
        actions[action]();
    } else {
        console.error('Invalid delete action:', action);
    }

});

initializedToaster('deletePost', 'success');
initializedToaster('deleteComment', 'success');
initializedToaster('deleteProfile', 'success');

/**
 * Signup for submission
 */
$('#signupModalSubmitBtn').on('click', function () {
    const button = $(this);

    const firstname = $('#firstName').val();
    const lastname = $('#lastName').val();
    const username = $('#username').val();
    const password = $('#password').val();

    const modal = mdb.Modal.getInstance(document.getElementById('signupModal'));

    handleAjax({
        url: '/auth/new',
        data: { firstname, lastname, username, password },
        onSuccess: (response) => {
            $('#firstName').val('');
            $('#lastName').val('');
            $('#username').val('');
            $('#password').val('');

            setToaster('signup', response.message);
        },
        onError: (error) => {
            notyf.error(error.responseJSON.message);
        },
        reloadOnSuccess: true,
        modal,
        button
    });

});

initializedToaster('signup', 'success');

/**
 * Login form submission
 */
$('#loginSubmitButton').on('click', function () {
    const username = $('#loginUsername').val().trim();
    const password = $('#loginPassword').val().trim();

    const button = $(this);

    const modal = mdb.Modal.getInstance(document.getElementById('loginModal'));

    handleAjax({
        url: '/auth/login',
        data: { username, password },
        onSuccess: () => {
            $('#username').val('');
            $('#password').val('');

            setToaster('loginSuccess', `Welcome back @${username}`);
        },
        onError: (error) => {
            notyf.error(error.responseJSON.message || 'Unexpected error occured.');
        },
        modal,
        button
    });

});

initializedToaster('loginSuccess', 'success');


/**
 * Terminate session logout
 */
$('#logoutBtn').on('click', function () {
    const button = $(this);

    handleAjax({
        url: '/auth/logout',
        type: 'POST',
        xhrFields: { withCredentials: true },
        onSuccess: (response) => {
            setToaster('logout', response.message);
        },
        button
    });

});

initializedToaster('logout', 'success');

/**
 * Edit profile submission
 */
$('#saveChanges').on('click', function () {
    const userId = $('#userIdEdit').val();

    const firstname = $('#editFirstName').val();
    const lastname = $('#editlastName').val();
    const username = $('#editUsername').val();
    const bio = $('#editBio').val();
    const profile_image = $('#profileImageInput')[0]?.files[0];

    const button = $(this);

    const profileFormData = new FormData();

    profileFormData.append('firstname', firstname);
    profileFormData.append('lastname', lastname);
    profileFormData.append('username', username);
    profileFormData.append('bio', bio);

    if (profile_image) {
        profileFormData.append('profileImage', profile_image);
    };

    handleAjax({
        url: `/${username}/edit`,
        method: 'PUT',
        data: profileFormData,
        onSuccess: () => {
            window.location = `/${username}`;
            setToaster('editProfile', 'Profile saved!');
        },
        onError: (error) => {
            const errorMessage = error.responseJSON?.error || 'An unexpected error occurred.';
            notyf.error(errorMessage);
        },
        reloadOnSuccess: false,
        button,
        contentType: false,
        processData: false
    });

});


initializedToaster('editProfile', 'success');

/**
 * Like button submmision
 */
$('.like-btn').on('click', function () {
    const button = $(this);
    const postId = button.data('post-id');

    handleAjax({
        url: '/likes/toggle',
        data: { postId },
        button,
        reloadOnSuccess: false,
        onSuccess: (response) => {


            button.setLoading(false);

            const liked = response.liked;
            const count = response.totalLikes;

            const $button = $(button);
            const $post = $button.closest('.post-container');

            // 1. Toggle button class
            $button.toggleClass('liked active', liked);

            // 2. Update icon (heart or thumbs-up)
            const $icon = $button.find('.like-icon');
            if (liked) {
                $icon.replaceWith(`
    <span class="like-icon badge bg-danger rounded-circle p-1 me-1" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-heart" style="font-size: 10px;"></i>
    </span>
  `);
            } else {
                $icon.replaceWith(`<i class="like-icon far fa-thumbs-up me-2"></i>`);
            }

            // 3. Update label
            $button.find('.like-label')
                .text(liked ? 'Liked' : 'Like')
                .toggleClass('text-danger', liked);

            // 4. Update like count and heart icon display
            const $likeCount = $post.find('.like-count');
            const $likeDisplay = $post.find('.like-display');

            $likeCount.text(count);

            if (count === 0) {
                $likeDisplay.hide();
            } else {
                $likeDisplay.show();
            }



            // <small class="text-muted like-count"><%= post.likeCount %></small>
            // <i class="fas ${iconClass} me-1"></i> ${label} <span class="badge badge-primary ms-1 like-count">${count}</span>

        },
        onError: (error) => {
            notyf.error(error.responseJSON.message);
        }
    });

});

initializedToaster('toggleLike', 'success');
