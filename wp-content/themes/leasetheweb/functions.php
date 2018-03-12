<?php

if (! class_exists('Timber')) {
    add_action('admin_notices', function () {
        echo '<div class="error"><p>Timber not activated. Make sure you '
        . 'activate the plugin in <a href="'
        . esc_url(admin_url('plugins.php#timber')) . '">'
        . esc_url(admin_url('plugins.php')) . '</a></p></div>';
    });
    return;
}

class LeaseTheWebSite extends TimberSite
{

    public function __construct()
    {
        add_theme_support('title-tag');
        add_theme_support('post-thumbnails');
        add_theme_support('menus');
        add_action('init', array( $this, 'cleanupHeader' ));
        add_action('init', array( $this, 'addMenus' ));
        add_filter('timber_context', array( $this, 'addToContext' ));
        add_action('wp_enqueue_scripts', array( $this, 'addStylesAndScripts' ), 999);
        add_action('widgets_init', array( $this, 'addSidebars' ));
        parent::__construct();
    }

    public function cleanupHeader()
    {
        remove_action('wp_head', 'rsd_link');
        remove_action('wp_head', 'wlwmanifest_link');
        remove_action('wp_head', 'index_rel_link');
        remove_action('wp_head', 'wp_generator');
        remove_action('wp_head', 'print_emoji_detection_script', 7);
        remove_action('admin_print_scripts', 'print_emoji_detection_script');
        remove_action('wp_print_styles', 'print_emoji_styles');
        remove_action('admin_print_styles', 'print_emoji_styles');
        remove_filter('the_content_feed', 'wp_staticize_emoji');
        remove_filter('comment_text_rss', 'wp_staticize_emoji');
        remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    }

    public function addToContext($context)
    {
        $context['menu'] = new TimberMenu('header-menu');
        $context['prim_footer_menu'] = new TimberMenu('prim-footer-menu');
        $context['sec_footer_menu'] = new TimberMenu('sec-footer-menu');
        $context['site'] = $this;
        $context['options'] = get_fields('options');
        return $context;
    }

    public function addStylesAndScripts()
    {
        global $wp_styles;

        if (!is_admin()) {
            wp_deregister_script('jquery');
            wp_enqueue_script(
                'jquery',
                get_template_directory_uri() . '/src/js/vendor/jquery.js',
                array(),
                '2.1.14',
                false
            );
            wp_enqueue_script(
                'site-js',
                get_template_directory_uri() . '/assets/js/source.dev.js',
                array( 'jquery' ),
                time(),
                true
            );
        }
    }

    public function addSidebars()
    {
        register_sidebar(array(
          'id' => 'sidebar',
          'name' => __('Default Sidebar'),
          'description' => __('Default sidebar for interior pages'),
          'before_widget' => '',
          'after_widget' => '',
          'before_title' => '<h3>',
          'after_title' => '</h3>'
        ));

        register_sidebar(array(
          'id' => 'sidebar_blog',
          'name' => __('Blog Sidebar'),
          'description' => __('Special sidebar for the blog'),
          'before_widget' => '',
          'after_widget' => '',
          'before_title' => '<h3>',
          'after_title' => '</h3>'
        ));
    }

    public function addMenus()
    {
        register_nav_menus(
            array(
            'header-menu' => __('Header Menu'),
            'prim-footer-menu' => __( 'Primary Footer Menu' ),
            'sec-footer-menu' => __( 'Secondary Footer Menu' ),
            )
        );
    }
}

new LeaseTheWebSite();

/**
* Returns the sidebar id for the page, based on page section
*/
function leasetheweb_get_sidebar_slug($post)
{
    if ($post->post_type == 'page') {
        $parents = array_reverse(get_post_ancestors($post->ID));
        $slug = '_';
        // If there are no parents, the page itself is a top-level page
        if (empty($parents)) {
            $slug .= $post->post_name;
        } else {
            $ancestor = get_post($parents[0]);
            $slug .= $ancestor->post_name;
        }

        return $slug;
    }

    // For blog posts, get the blog sidebar
    if ($post->post_type == 'post') {
        return 'blog';
    }

    return '';
}

if (function_exists('acf_add_options_page')) {
  acf_add_options_page('Theme Settings');
}

// Customize TinyMCE settings
require_once(get_template_directory() . '/includes/leasetheweb_editor_styles.php');

// Custom Shortcodes
require_once(get_template_directory() . '/includes/leasetheweb_shortcodes.php');
