<?php
/**
* Index template
*
* A fallback list template used if a more specific template is not available
*
*/

if (! class_exists('Timber')) {
  echo 'Timber not activated. Make sure you activate the plugin in ' .
  '<a href="/wp-admin/plugins.php#timber">/wp-admin/plugins.php</a>';
  return;
}
$context = Timber::get_context();
$context['post'] = Timber::get_post();
$templates = array( 'index.twig' );

if (is_singular('post')) {
  array_unshift( $templates, 'post.twig' );
}

if (post_password_required($post->ID)) {
  //action URL for the post-level password protection form
  $context['password_form_action_url'] = '/wp-login.php?action=postpass';
  Timber::render('single-password.twig', $context);
} else {
  Timber::render($templates, $context);
}
