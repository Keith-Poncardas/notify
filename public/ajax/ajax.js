
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
                url: '/private/create',
                data: formData,
                contentType: false,
                processData: false,
                onSuccess: () => {
                    setToaster('createPost', 'Post created succesfully!');
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
                url: `/private/${id}/edit-post`,
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
                url: `/private/${id}/create-comment`,
                data: { content, userId },
                button,
                modal,
            });

        },
        'edit-comment': () => {

            handleAjax({
                url: `/private/${id}/edit-comment`,
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

/**
 * Delete handler
 */
$('.deleteButton').on('click', function (event) {
    const button = $(this);
    const id = button.data('id');
    const action = button.data('action');

    const actions = {
        'delete-post': () => {
            handleAjax({
                url: `/private/${id}/delete-post`,
                method: 'DELETE',
                data: { id },
                button,
                onSuccess: () => {
                    setToaster('deletePost', 'Post deleted!');
                },
                onError: () => {
                    notyf.error('Failed to delete post.');
                }
            });
        },
        'delete-comment': () => {
            handleAjax({
                url: `/private/${id}/delete-comment`,
                method: 'DELETE',
                data: { id },
                button,
                onSuccess: () => {
                    setToaster('deleteComment', 'Comment deleted!');
                }
            });
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
        url: '/auth/create-user',
        data: { firstname, lastname, username, password },
        onSuccess: () => {
            $('#firstName').val('');
            $('#lastName').val('');
            $('#username').val('');
            $('#password').val('');

            setToaster('signup', `Welcome @${username}!`);
        },
        onError: (err) => {
            notyf.error(err.responseJSON.error);
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
        url: '/auth/login-user',
        data: { username, password },
        onSuccess: () => {
            $('#username').val('');
            $('#password').val('');

            setToaster('loginSuccess', `Welcome back @${username}`);
        },
        onError: (error) => {
            const errorMessage = error.responseJSON?.error || 'An unexpected error occurred.';
            notyf.error(errorMessage);
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
        onSuccess: () => {
            setToaster('logout', "Logout Successfully!");
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
        url: '/private/edit-user',
        method: 'PUT',
        data: profileFormData,
        onSuccess: () => {
            window.location = `/home/${userId}/profile`;
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
        url: '/private/like',
        data: { postId },
        button,
        reloadOnSuccess: false,
        onSuccess: (response) => {

            button.setLoading(false);

            const iconClass = response.liked ? 'fa-thumbs-down' : 'fa-thumbs-up';
            const label = response.liked ? 'Liked' : 'Like';
            const count = response.totalLikes;

            const restoredButton = $(`.like-btn[data-post-id="${postId}"]`);
            const isLiked = restoredButton.hasClass('liked');

            if (isLiked) {
                restoredButton.removeClass('active');
            } else {
                restoredButton.addClass('active');
            }

            restoredButton
                .html(`<i class="fas ${iconClass} me-1"></i> ${label} <span class="badge badge-primary ms-1 like-count">${count}</span>`)
                .toggleClass('liked');
        }
    });

});
